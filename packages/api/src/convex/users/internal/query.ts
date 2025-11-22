import { v } from "convex/values";
import { internalQuery } from "../../_generated/server";
import { findUserById } from "../utils";

export const findById = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    return await findUserById(ctx, userId);
  },
});
