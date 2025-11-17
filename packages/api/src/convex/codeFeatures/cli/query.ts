import { ConvexError, v } from "convex/values";
import { cliProtectedQuery } from "../../functions";

export const getBySlugForInstall = cliProtectedQuery({
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
      throw new ConvexError(`Feature "${args.slug}" not found`);
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
