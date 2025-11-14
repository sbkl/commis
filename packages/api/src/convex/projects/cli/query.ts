import { cliProtectedQuery } from "../../functions";

export const list = cliProtectedQuery({
  args: {},
  async handler(ctx) {
    return await ctx.db.query("projects").collect();
  },
});
