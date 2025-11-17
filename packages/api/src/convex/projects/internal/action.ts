import { ConvexError, v } from "convex/values";
import { internalAction } from "../../functions";
import { internal } from "../../_generated/api";

export const setupConvex = internalAction({
  args: {
    projectId: v.id("projects"),
    projectSlug: v.string(),
    accessToken: v.string(),
    convexTeamSlug: v.string(),
    convexTeamId: v.number(),
  },
  handler: async (ctx, args) => {
    const url = `https://api.convex.dev/v1/teams/${args.convexTeamId}/create_project`;
    console.log("url", url, args);
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${args.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        deploymentType: "dev",
        projectName: args.projectSlug,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new ConvexError(
        `Failed to create Convex project: ${res.statusText} - ${errorText}`
      );
    }

    const data = await res.json();

    console.log("data", data);

    const deployRes = await fetch(
      `https://api.convex.dev/v1/deployments/${data.deploymentName}/create_deploy_key`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${args.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "commis-deployment-key",
        }),
      }
    );

    if (!deployRes.ok) {
      const errorText = await deployRes.text();
      throw new ConvexError(
        `Failed to create Convex deployment key: ${deployRes.statusText} - ${errorText}`
      );
    }

    const deployData = await deployRes.json();

    const allProjectsRes = await fetch(
      `https://api.convex.dev/v1/teams/${args.convexTeamId}/list_projects`,
      {
        headers: {
          Authorization: `Bearer ${args.accessToken}`,
        },
      }
    );
    if (!allProjectsRes.ok) {
      const errorText = await res.text();
      throw new ConvexError(
        `Failed to test Convex API: ${res.statusText} - ${errorText}`
      );
    }

    const projectList = await allProjectsRes.json();

    const convexProject = projectList.find(
      (project: any) => project.id === data.projectId
    );
    if (!convexProject) {
      throw new ConvexError(`Convex project not found`);
    }

    await ctx.runMutation(
      internal.projects.internal.mutation.finaliseConvexSetup,
      {
        projectId: args.projectId,
        convexTeamSlug: args.convexTeamSlug,
        convexTeamId: args.convexTeamId,
        convexDeploymentName: data.deploymentName,
        convexDeploymentUrl: data.deploymentUrl,
        convexProjectId: data.projectId,
        convexSlug: convexProject.slug,
        adminKey: deployData.deployKey,
      }
    );
    return "success";
  },
});
