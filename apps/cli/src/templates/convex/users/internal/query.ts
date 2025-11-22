// @ts-nocheck
import { internalQuery } from "@/convex/functions";
import { v } from "convex/values";
import { findUserById } from "@/convex/users/utils";

export const findById = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    return await findUserById(ctx, userId);
  },
});
