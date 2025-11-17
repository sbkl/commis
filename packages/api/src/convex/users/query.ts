import { protectedQuery, publicQuery } from "../functions";

export const protectedMeOrThrow = protectedQuery({
  args: {},
  async handler(ctx) {
    return ctx.user;
  },
});

export const me = publicQuery({
  args: {},
  async handler(ctx) {
    const user = ctx.user;
    if (!user) {
      return null;
    }
    const config = await ctx.db
      .query("userConfigs")
      .withIndex("userId", (q) => q.eq("userId", user._id))
      .first();
    return {
      ...user,
      config,
    };
  },
});
