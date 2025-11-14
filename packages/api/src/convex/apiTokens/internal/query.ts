import { ConvexError, v } from "convex/values";
import { internalQuery } from "../../functions";

export const find = internalQuery({
  args: {
    apiTokenId: v.id("apiTokens"),
  },
  handler: async (ctx, { apiTokenId }) => {
    const apiToken = await ctx.db.get(apiTokenId);
    if (!apiToken) {
      throw new ConvexError("API token not found");
    }
    const user = await ctx.db.get(apiToken.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }
    return {
      ...apiToken,
      user,
    };
  },
});
