import { ConvexError, v } from "convex/values";
import { protectedMutation } from "../functions";

export const storeConvexAccessToken = protectedMutation({
  args: {
    accessToken: v.string(),
    convexTeamId: v.number(),
  },
  handler: async (ctx, args) => {
    const convexTeamSlug = args.accessToken.split("|")[0]?.split(":")[1];
    if (!convexTeamSlug) {
      throw new ConvexError("Invalid access token");
    }

    await ctx.db.insert("userConfigs", {
      userId: ctx.user._id,
      convexTeamSlug,
      convexTeamId: args.convexTeamId,
      convexAccessToken: args.accessToken,
    });
  },
});
