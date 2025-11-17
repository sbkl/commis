import { ConvexError, v } from "convex/values";
import { protectedQuery } from "../functions";
import type { Id } from "../_generated/dataModel";

export const list = protectedQuery({
  args: {},
  async handler(ctx) {
    const features = await Promise.all(
      (
        await ctx.db
          .query("codeFeatures")
          .filter((q) => q.eq(q.field("isPublic"), true))
          .collect()
      ).map(async (f) => {
        const files = await ctx.db
          .query("codeFeatureFiles")
          .withIndex("codeFeatureId", (q) => q.eq("codeFeatureId", f._id))
          .collect();
        return {
          ...f,
          files: [
            ...files,
            {
              _id: "package.json" as Id<"codeFeatureFiles">,
              _creationTime: f._creationTime,
              path: "package.json",
              codeFeatureId: f._id,
              language: "json" as const,
              content: JSON.stringify(
                {
                  name: f.slug,
                  version: f.version,
                  dependencies: f.dependencies,
                },
                null,
                2
              ),
            },
          ],
        };
      })
    );

    return features;
  },
});

export const getBySlug = protectedQuery({
  args: {
    slug: v.string(),
  },
  async handler(ctx, args) {
    const feature = await ctx.db
      .query("codeFeatures")
      .withIndex("slug", (q) => q.eq("slug", args.slug))
      .filter((q) => q.eq(q.field("isPublic"), true))
      .first();

    if (!feature) {
      throw new ConvexError("Feature not found");
    }

    const files = await ctx.db
      .query("codeFeatureFiles")
      .withIndex("codeFeatureId", (q) => q.eq("codeFeatureId", feature._id))
      .collect();

    return {
      ...feature,
      files,
    };
  },
});

export const myFeatures = protectedQuery({
  args: {},
  async handler(ctx) {
    return await ctx.db
      .query("codeFeatures")
      .withIndex("userId", (q) => q.eq("userId", ctx.user._id))
      .collect();
  },
});
