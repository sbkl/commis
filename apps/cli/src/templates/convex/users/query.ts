// @ts-nocheck
import { protectedQuery, publicQuery } from "@/convex/functions";

export const meOrThrow = protectedQuery({
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
