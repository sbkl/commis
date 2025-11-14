import { v } from "convex/values";
import { cliProtectedQuery, protectedQuery } from "../../functions";

/**
 * Get the working directory for a specific device
 */
export const getWorkingDirectory = cliProtectedQuery({
  args: {
    deviceId: v.string(),
  },
  handler: async (ctx, args) => {
    const workingDir = await ctx.db
      .query("userWorkingDirectories")
      .withIndex("userId_device", (q) =>
        q.eq("userId", ctx.user._id).eq("device", args.deviceId)
      )
      .first();

    return workingDir?.directory ?? null;
  },
});

/**
 * Get all working directories for the current user
 */
export const getAllWorkingDirectories = cliProtectedQuery({
  args: {},
  handler: async (ctx) => {
    const workingDirs = await ctx.db
      .query("userWorkingDirectories")
      .withIndex("userId_device", (q) => q.eq("userId", ctx.user._id))
      .collect();

    return workingDirs;
  },
});

/**
 * Get all devices for the current user
 */
export const getDevices = cliProtectedQuery({
  args: {},
  handler: async (ctx) => {
    const apiTokens = await ctx.db
      .query("apiTokens")
      .withIndex("userId", (q) => q.eq("userId", ctx.user._id))
      .filter((q) => q.neq(q.field("deviceId"), undefined))
      .collect();

    // Get unique devices
    const deviceMap = new Map();

    for (const token of apiTokens) {
      if (token.deviceId && !deviceMap.has(token.deviceId)) {
        deviceMap.set(token.deviceId, {
          deviceId: token.deviceId,
          deviceName: token.deviceName ?? "Unknown Device",
          hostname: token.deviceHostname,
          platform: token.devicePlatform,
          lastUsedAt: token.lastUsedAt,
        });
      } else if (token.deviceId && token.lastUsedAt) {
        // Update last used if this token was used more recently
        const existing = deviceMap.get(token.deviceId);
        if (!existing.lastUsedAt || token.lastUsedAt > existing.lastUsedAt) {
          deviceMap.set(token.deviceId, {
            ...existing,
            lastUsedAt: token.lastUsedAt,
          });
        }
      }
    }

    return Array.from(deviceMap.values());
  },
});

/**
 * Get current device info from the API token
 * Note: This is a placeholder for future enhancement
 */
export const getCurrentDevice = protectedQuery({
  args: {},
  handler: async () => {
    // The token is available from ctx through the protectedQuery
    // We need to find the API token that was used for this request
    // This information should be available through the auth context

    // For now, return null - this would need to be enhanced based on
    // how you're passing the token and storing it in the context
    return null;
  },
});
