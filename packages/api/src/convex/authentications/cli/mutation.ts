import { authenticationStatusSchema } from "@commis/schemas/authentications";
import { zodToConvex } from "convex-helpers/server/zod4";
import { v } from "convex/values";
import { cliProtectedMutation } from "../../functions";

export const patchStatus = cliProtectedMutation({
  args: {
    id: v.id("authentications"),
    status: zodToConvex(authenticationStatusSchema),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
    });
    return args.id;
  },
});
