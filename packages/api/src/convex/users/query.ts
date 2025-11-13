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
    return ctx.user;
  },
});
