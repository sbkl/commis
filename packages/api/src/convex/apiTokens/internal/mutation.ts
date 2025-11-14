import { ConvexError, v } from "convex/values";
import { internalMutation } from "../../functions";

export const finalise = internalMutation({
  args: {
    token: v.string(),
    apiTokenId: v.id("apiTokens"),
    expiresAt: v.optional(v.number()),
    refreshToken: v.optional(v.string()),
    refreshExpiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verify the app exists
    const apiToken = await ctx.db.get(args.apiTokenId);
    if (!apiToken) {
      throw new ConvexError("API token not found");
    }
    await ctx.db.patch(args.apiTokenId, {
      token: args.token,
      expiresAt: args.expiresAt,
      refreshToken: args.refreshToken,
      refreshExpiresAt: args.refreshExpiresAt,
    });

    return apiToken;
  },
});
