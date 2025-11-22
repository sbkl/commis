import { v } from "convex/values";
import { cliProtectedMutation } from "../../functions";
import { zodToConvex } from "convex-helpers/server/zod4";
import { uiComponentStatusSchema } from "@commis/schemas/uiComponents";

export const patchStatus = cliProtectedMutation({
  args: {
    id: v.id("uiComponentsOnProjects"),
    status: zodToConvex(uiComponentStatusSchema),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "installed",
    });
  },
});
