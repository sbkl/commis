import { ConvexError, v } from "convex/values";
import { protectedMutation } from "../functions";

export const upsert = protectedMutation({
  args: {
    projectId: v.id("projects"),
    uiComponentIds: v.array(v.id("uiComponents")),
  },
  async handler(ctx, args) {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new ConvexError("Project not found");
    }
    const existingUiComponentsOnProject = await ctx.db
      .query("uiComponentsOnProjects")
      .withIndex("projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    const uiComponentInputs = await Promise.all(
      args.uiComponentIds.map(async (uiComponentId) => {
        const uiComponent = await ctx.db.get(uiComponentId);
        if (!uiComponent) {
          throw new ConvexError("UI component not found");
        }
        return uiComponent;
      })
    );

    // removeUiComponentsOnProject: if uiComponentInputs is in existingUiComponentsOnProject, remove it
    const removeUiComponentsOnProjects = existingUiComponentsOnProject.filter(
      (c) =>
        !uiComponentInputs.some(
          (uiComponent) => uiComponent._id === c.uiComponentId
        )
    );
    // addUiComponentsOnProject: if uiComponentInputs is not in existingUiComponentsOnProject, add it
    const addUiComponentsOnProjects = uiComponentInputs.filter(
      (uiComponent) =>
        !existingUiComponentsOnProject.some(
          (c) => c.uiComponentId === uiComponent._id
        )
    );

    for (const component of addUiComponentsOnProjects) {
      await ctx.db.insert("uiComponentsOnProjects", {
        projectId: args.projectId,
        userId: ctx.user._id,
        uiComponentId: component._id,
        status: "pending",
      });
    }

    for (const component of removeUiComponentsOnProjects) {
      await ctx.db.delete(component._id);
    }
  },
});
