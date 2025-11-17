import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { protectedMutation, publicMutation } from "../functions";
import { generateRandomCode, hashToken } from "../apiTokens/utils";
import { env } from "../env";

// Generate a device code for CLI authentication
export const generateDeviceCode = publicMutation({
  args: {},
  handler: async (ctx) => {
    // Generate random codes
    const deviceCode = generateRandomCode(32);
    const code = generateRandomCode(8).toUpperCase();

    // Expire in 10 minutes
    const expiresAt = Date.now() + 10 * 60 * 1000;

    await ctx.db.insert("cliAuthSessions", {
      deviceCode,
      code,
      expiresAt,
      verified: false,
    });

    return {
      deviceCode,
      code,
      expiresAt,
      verificationUrl: `${env.SITE_URL}/auth/device`,
    };
  },
});

// Verify a device code after user has authenticated
export const verifyDeviceCode = protectedMutation({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("cliAuthSessions")
      .withIndex("code", (q) => q.eq("code", args.code))
      .first();

    if (!session) {
      throw new ConvexError("Invalid code");
    }

    if (session.expiresAt < Date.now()) {
      throw new ConvexError("Code expired");
    }

    if (session.verified) {
      throw new ConvexError("Code already used");
    }

    await ctx.db.patch(session._id, {
      userId: ctx.user._id,
      verified: true,
    });

    return { success: true };
  },
});

// Poll for device code verification (used by CLI)
export const pollDeviceCode = publicMutation({
  args: {
    deviceCode: v.string(),
    deviceInfo: v.optional(
      v.object({
        deviceId: v.string(),
        deviceName: v.string(),
        hostname: v.string(),
        platform: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("cliAuthSessions")
      .withIndex("deviceCode", (q) => q.eq("deviceCode", args.deviceCode))
      .first();

    if (!session) {
      throw new ConvexError("Invalid device code");
    }

    if (session.expiresAt < Date.now()) {
      throw new ConvexError("Code expired");
    }

    if (!session.verified || !session.userId) {
      return { verified: false };
    }

    const user = await ctx.db.get(session.userId);

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Generate an API token for the CLI
    const apiToken = generateRandomCode(64);
    const refreshToken = generateRandomCode(64);

    // Hash both tokens for secure storage
    const tokenHash = await hashToken(apiToken);
    const refreshTokenHash = await hashToken(refreshToken);

    // Token expires in 7 days, refresh token expires in 30 days
    const tokenExpiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const refreshExpiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;

    await ctx.db.insert("apiTokens", {
      userId: session.userId,
      token: tokenHash, // Store hash, not plain or encrypted token
      refreshToken: refreshTokenHash, // Store hash of refresh token
      name: args.deviceInfo?.deviceName || "CLI",
      expiresAt: tokenExpiresAt,
      refreshExpiresAt: refreshExpiresAt,
      // Store device information if provided
      deviceId: args.deviceInfo?.deviceId,
      deviceName: args.deviceInfo?.deviceName,
      deviceHostname: args.deviceInfo?.hostname,
      devicePlatform: args.deviceInfo?.platform,
    });

    // Clean up the session
    await ctx.db.delete(session._id);

    return {
      verified: true,
      token: apiToken,
      refreshToken,
    };
  },
});

// Refresh an access token using a refresh token
export const refreshAccessToken = publicMutation({
  args: {
    refreshToken: v.string(),
  },
  handler: async (ctx, args) => {
    // Hash the refresh token to find the matching record
    const refreshTokenHash = await hashToken(args.refreshToken);

    const apiToken = await ctx.db
      .query("apiTokens")
      .withIndex("refreshToken", (q) => q.eq("refreshToken", refreshTokenHash))
      .first();

    if (!apiToken) {
      throw new ConvexError("Invalid refresh token");
    }

    // Check if refresh token is expired
    if (apiToken.refreshExpiresAt && apiToken.refreshExpiresAt < Date.now()) {
      // Clean up expired token
      await ctx.db.delete(apiToken._id);
      throw new ConvexError("Refresh token expired");
    }

    // Verify user still exists
    const user = await ctx.db.get(apiToken.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    // Generate new access token AND new refresh token (token rotation)
    const newAccessToken = generateRandomCode(64);
    const newRefreshToken = generateRandomCode(64);

    const newAccessTokenHash = await hashToken(newAccessToken);
    const newRefreshTokenHash = await hashToken(newRefreshToken);

    // Update both tokens and reset expiration times
    const newTokenExpiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const newRefreshExpiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;

    await ctx.db.patch(apiToken._id, {
      token: newAccessTokenHash,
      refreshToken: newRefreshTokenHash,
      expiresAt: newTokenExpiresAt,
      refreshExpiresAt: newRefreshExpiresAt,
      lastUsedAt: Date.now(),
    });

    return {
      token: newAccessToken,
      refreshToken: newRefreshToken,
      expiresAt: newTokenExpiresAt,
    };
  },
});
