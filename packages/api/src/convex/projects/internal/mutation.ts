import { ConvexError, v } from "convex/values";
import { internalMutation } from "../../functions";

export const finaliseConvexSetup = internalMutation({
  args: {
    projectId: v.id("projects"),
    convexDeploymentName: v.string(),
    convexDeploymentUrl: v.string(),
    convexProjectId: v.number(),
    convexTeamSlug: v.string(),
    convexTeamId: v.number(),
    convexSlug: v.string(),
    adminKey: v.string(),
  },
  async handler(ctx, { projectId, ...args }) {
    const project = await ctx.db.get(projectId);

    if (!project) {
      throw new ConvexError("Project not found");
    }

    await ctx.db.patch(projectId, {
      ...args,
      status: "create",
    });
  },
});
