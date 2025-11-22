import { v } from "convex/values";
import { cliProtectedQuery } from "../../functions";
import { projectStatusSchema } from "@commis/schemas/projects";
import { zodToConvex } from "convex-helpers/server/zod4";

export const list = cliProtectedQuery({
  args: {
    status: v.optional(zodToConvex(projectStatusSchema)),
  },
  async handler(ctx, { status }) {
    if (status) {
      return await ctx.db
        .query("projects")
        .withIndex("status", (q) =>
          q.eq("status", status).eq("userId", ctx.user._id)
        )
        .collect();
    }
    return await ctx.db
      .query("projects")
      .withIndex("userId", (q) => q.eq("userId", ctx.user._id))
      .collect();
  },
});
