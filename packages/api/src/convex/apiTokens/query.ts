import { v } from "convex/values";
import { publicQuery, protectedQuery } from "../functions";
import { hashToken } from "./utils";

export const verifyToken = publicQuery({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Hash the incoming token to compare with stored hash
    const tokenHash = await hashToken(args.token);

    const apiToken = await ctx.db
      .query("apiTokens")
      .withIndex("token", (q) => q.eq("token", tokenHash))
      .first();

    if (!apiToken) {
      return null;
    }

    const user = await ctx.db.get(apiToken.userId);

    if (!user) {
      return null;
    }

    // Return user with device information
    return {
      ...user,
      deviceId: apiToken.deviceId,
      deviceName: apiToken.deviceName,
      deviceHostname: apiToken.deviceHostname,
      devicePlatform: apiToken.devicePlatform,
    };
  },
});

export const listUserTokens = protectedQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("apiTokens")
      .withIndex("userId", (q) => q.eq("userId", ctx.user._id))
      .collect();
  },
});
