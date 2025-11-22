import { ConvexError, v } from "convex/values";
import { protectedMutation } from "../functions";
import { internal } from "../_generated/api";

export const create = protectedMutation({
  args: {
    projectId: v.id("projects"),
    clientId: v.string(),
    clientSecret: v.string(),
  },
  async handler(ctx, { projectId, clientId, clientSecret }) {
    const config = await ctx.db
      .query("userConfigs")
      .withIndex("userId", (q) => q.eq("userId", ctx.user._id))
      .first();
    const accessToken = config?.convexAccessToken;

    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new ConvexError("Project not found");
    }
    const convexDeploymentName = project.convexDeploymentName;
    if (!convexDeploymentName) {
      throw new ConvexError("No Convex deployment name found");
    }
    if (!accessToken) {
      throw new ConvexError("No Convex access token found");
    }
    const authenticationId = await ctx.db.insert("authentications", {
      projectId,
      provider: "convex",
      oauthProvider: "github",
      clientId,
      clientSecret,
      status: "init",
      userId: ctx.user._id,
    });

    const sonnerUiComponent = await ctx.db
      .query("uiComponents")
      .withIndex("vendor_name", (q) =>
        q.eq("vendor", "shadcn").eq("name", "sonner")
      )
      .unique();

    if (!sonnerUiComponent) {
      throw new ConvexError("Sonner UI component not found");
    }
    const existingSonnerUiComponentOnProject = await ctx.db
      .query("uiComponentsOnProjects")
      .withIndex("projectId_uiComponentId", (q) =>
        q.eq("projectId", projectId).eq("uiComponentId", sonnerUiComponent._id)
      )
      .unique();
    if (!existingSonnerUiComponentOnProject) {
      await ctx.db.insert("uiComponentsOnProjects", {
        projectId,
        uiComponentId: sonnerUiComponent._id,
        status: "pending",
        userId: ctx.user._id,
      });
    }

    const buttonUiComponent = await ctx.db
      .query("uiComponents")
      .withIndex("vendor_name", (q) =>
        q.eq("vendor", "shadcn").eq("name", "button")
      )
      .unique();

    if (!buttonUiComponent) {
      throw new ConvexError("Button UI component not found");
    }
    const existingButtonUiComponentOnProject = await ctx.db
      .query("uiComponentsOnProjects")
      .withIndex("projectId_uiComponentId", (q) =>
        q.eq("projectId", projectId).eq("uiComponentId", buttonUiComponent._id)
      )
      .unique();
    if (!existingButtonUiComponentOnProject) {
      await ctx.db.insert("uiComponentsOnProjects", {
        projectId,
        uiComponentId: buttonUiComponent._id,
        status: "pending",
        userId: ctx.user._id,
      });
    }

    await ctx.scheduler.runAfter(
      0,
      internal.authentications.internal.action.generateConvexAuthKeys,
      {
        projectId,
        authenticationId,
        accessToken,
        convexDeploymentName,
        clientId,
        clientSecret,
      }
    );
    return authenticationId;
  },
});
