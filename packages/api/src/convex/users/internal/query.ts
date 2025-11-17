import { internalQuery } from "../../functions";
import { v } from "convex/values";

export const findById = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    const config = await ctx.db
      .query("userConfigs")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .unique();
    return {
      ...user,
      config,
    };
  },
});
