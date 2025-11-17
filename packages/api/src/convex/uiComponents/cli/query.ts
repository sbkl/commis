import { ConvexError } from "convex/values";
import { cliProtectedQuery } from "../../functions";

export const pendingUiComponents = cliProtectedQuery({
  args: {},
  async handler(ctx) {
    return await Promise.all(
      (
        await ctx.db
          .query("uiComponentsOnProjects")
          .withIndex("userId_status", (q) =>
            q.eq("userId", ctx.user._id).eq("status", "pending")
          )
          .collect()
      ).map(async (projectUiComponent) => {
        const project = await ctx.db.get(projectUiComponent.projectId);
        const uiComponent = await ctx.db.get(projectUiComponent.uiComponentId);
        if (!project || !uiComponent) {
          throw new ConvexError("Project not found");
        }
        return {
          ...projectUiComponent,
          uiComponent,
          project,
        };
      })
    );
  },
});
