import { authenticationStatusSchema } from "@commis/schemas/authentications";
import { v } from "convex/values";
import { internalMutation } from "../../functions";
import { zodToConvex } from "convex-helpers/server/zod4";

export const patchStatus = internalMutation({
  args: {
    authenticationId: v.id("authentications"),
    status: zodToConvex(authenticationStatusSchema),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.authenticationId, {
      status: args.status,
    });
  },
});
