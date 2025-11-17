import { protectedMutation } from "../functions";
import {
  frameworkSchema,
  packageManagerSchema,
} from "@commis/schemas/projects";
import { zodToConvex } from "convex-helpers/server/zod";
import { ConvexError, v } from "convex/values";
import { generateSlug } from "../shared/utils";
import { internal } from "../_generated/api";

export const create = protectedMutation({
  args: {
    name: v.string(),
    framework: zodToConvex(frameworkSchema),
    packageManager: zodToConvex(packageManagerSchema),
  },
  async handler(ctx, args) {
    const config = await ctx.db
      .query("userConfigs")
      .withIndex("userId", (q) => q.eq("userId", ctx.user._id))
      .first();

    if (!config) {
      throw new ConvexError("No Convex team found");
    }

    const slug = await generateSlug(ctx, {
      value: args.name,
      table: "projects",
    });

    const projectId = await ctx.db.insert("projects", {
      ...args,
      userId: ctx.user._id,
      slug,
      currentStep: "Creating Convex project",
      status: "init",
    });

    await ctx.scheduler.runAfter(
      0,
      internal.projects.internal.action.setupConvex,
      {
        projectId,
        projectSlug: slug,
        accessToken: config.convexAccessToken,
        convexTeamSlug: config.convexTeamSlug,
        convexTeamId: config.convexTeamId,
      }
    );
    return slug;
  },
});
