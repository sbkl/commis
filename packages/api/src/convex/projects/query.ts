import { ConvexError, v } from "convex/values";
import { protectedQuery } from "../functions";
import { paginationOptsValidator } from "convex/server";

export const list = protectedQuery({
  args: {
    searchQuery: v.optional(v.union(v.string(), v.null())),
    paginationOpts: paginationOptsValidator,
  },
  async handler(ctx, { paginationOpts, searchQuery }) {
    if (searchQuery) {
      return await ctx.db
        .query("projects")
        .withSearchIndex("name", (q) =>
          q.search("name", searchQuery).eq("userId", ctx.user._id)
        )
        .paginate(paginationOpts);
    }
    return await ctx.db
      .query("projects")
      .withIndex("userId", (q) => q.eq("userId", ctx.user._id))
      .order("desc")
      .paginate(paginationOpts);
  },
});
export const protectedFindOrThrow = protectedQuery({
  args: {
    slug: v.string(),
  },
  async handler(ctx, { slug }) {
    const project = await ctx.db
      .query("projects")
      .withIndex("slug", (q) => q.eq("slug", slug).eq("userId", ctx.user._id))
      .unique();
    if (!project) {
      throw new ConvexError("Project not found");
    }
    const authentication = await ctx.db
      .query("authentications")
      .withIndex("projectId", (q) => q.eq("projectId", project._id))
      .unique();

    const uiComponents = await Promise.all(
      (
        await ctx.db
          .query("uiComponentsOnProjects")
          .withIndex("projectId", (q) => q.eq("projectId", project._id))
          .collect()
      ).map(async (projectUiComponent) => {
        const uiComponent = await ctx.db.get(projectUiComponent.uiComponentId);
        if (!uiComponent) {
          throw new ConvexError("Component or project not found");
        }
        return {
          ...projectUiComponent,
          project,
          uiComponent,
        };
      })
    );
    return {
      ...project,
      authentication,
      uiComponents,
    };
  },
});
