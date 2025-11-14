import { ConvexError, v } from "convex/values";
import { cliProtectedMutation } from "../../functions";
import { zodToConvex } from "convex-helpers/server/zod";
import { projectStatusSchema, stepSchema } from "@commis/schemas/projects";

export const patchStatus = cliProtectedMutation({
  args: {
    slug: v.string(),
    status: zodToConvex(projectStatusSchema),
    currentStep: v.optional(zodToConvex(stepSchema)),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db
      .query("projects")
      .withIndex("slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!project || project.userId !== ctx.user._id) {
      throw new ConvexError("Project not found");
    }
    await ctx.db.patch(project._id, {
      status: args.status,
      currentStep: args.currentStep,
    });
    return project._id;
  },
});
