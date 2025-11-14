import { protectedMutation } from "../functions";
import {
  frameworkSchema,
  packageManagerSchema,
} from "@commis/schemas/projects";
import { zodToConvex } from "convex-helpers/server/zod";
import { v } from "convex/values";
import { generateSlug } from "../shared/utils";

export const create = protectedMutation({
  args: {
    name: v.string(),
    framework: zodToConvex(frameworkSchema),
    packageManager: zodToConvex(packageManagerSchema),
  },
  async handler(ctx, args) {
    const slug = await generateSlug(ctx, {
      value: args.name,
      table: "projects",
    });

    await ctx.db.insert("projects", {
      ...args,
      userId: ctx.user._id,
      slug,
      currentStep: "Initializing project",
      status: "create",
    });
    return slug;
  },
});
