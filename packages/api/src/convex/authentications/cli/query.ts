import { ConvexError, v } from "convex/values";
import { cliProtectedQuery } from "../../functions";
import { zodToConvex } from "convex-helpers/server/zod4";
import { authenticationStatusSchema } from "@commis/schemas/authentications";

export const list = cliProtectedQuery({
  args: {
    status: v.optional(zodToConvex(authenticationStatusSchema)),
  },
  async handler(ctx, { status }) {
    if (status) {
      const authentications = await ctx.db
        .query("authentications")
        .withIndex("status", (q) =>
          q.eq("status", status).eq("userId", ctx.user._id)
        )
        .collect();
      return await Promise.all(
        authentications.map(async (authentication) => {
          const project = await ctx.db.get(authentication.projectId);
          if (!project) {
            throw new ConvexError("Project not found");
          }
          return {
            ...authentication,
            project,
          };
        })
      );
    }
    const authentications = await ctx.db
      .query("authentications")
      .withIndex("userId", (q) => q.eq("userId", ctx.user._id))
      .collect();
    return await Promise.all(
      authentications.map(async (authentication) => {
        const project = await ctx.db.get(authentication.projectId);
        if (!project) {
          throw new ConvexError("Project not found");
        }
        return {
          ...authentication,
          project,
        };
      })
    );
  },
});
