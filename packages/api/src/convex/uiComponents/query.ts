import { v } from "convex/values";
import { protectedQuery } from "../functions";
import { zodToConvex } from "convex-helpers/server/zod4";
import { uiComponentVendorSchema } from "@commis/schemas/uiComponents";

export const list = protectedQuery({
  args: {
    vendor: v.optional(zodToConvex(uiComponentVendorSchema)),
    searchQuery: v.optional(v.string()),
  },
  async handler(ctx, { vendor = "shadcn", searchQuery }) {
    if (searchQuery) {
      return await ctx.db
        .query("uiComponents")
        .withSearchIndex("name", (q) =>
          q.search("name", searchQuery).eq("vendor", vendor)
        )
        .collect();
    }
    if (vendor) {
      return await ctx.db
        .query("uiComponents")
        .withIndex("vendor_name", (q) => q.eq("vendor", vendor))
        .collect();
    }
    return await ctx.db.query("uiComponents").collect();
  },
});
