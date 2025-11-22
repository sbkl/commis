// @ts-nocheck
import { internalQuery } from "@/convex/functions";
import { v } from "convex/values";

export const findById = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});
