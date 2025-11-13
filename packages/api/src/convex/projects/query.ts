import { ConvexError, v } from "convex/values";
import { protectedQuery } from "../functions";

export const protectedFindOrThrow = protectedQuery({
  args: {
    slug: v.string(),
  },
  async handler(ctx, { slug }) {
    const project = await ctx.db
      .query("projects")
      .withIndex("slug", (q) => q.eq("slug", slug).eq("userId", ctx.user._id))
      .unique();
    if (!project) {
      throw new ConvexError("Project not found");
    }
    return project;
  },
});
