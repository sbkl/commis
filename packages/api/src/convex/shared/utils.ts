import slug from "slug";
import type { ProtectedMutationCtx } from "../types/functions";
import type { TableNames } from "../_generated/dataModel";

interface GenerateSlugProps {
  value: string;
  table: string;
}

export async function generateSlug(
  ctx: ProtectedMutationCtx,
  args: GenerateSlugProps
) {
  const baseSlug = slug(args.value, {
    lower: true,
    trim: true,
    replacement: "-",
  });
  // First try without a number
  const existingBase = await ctx.db
    .query(args.table as TableNames)
    .withIndex("slug" as any, (q) => q.eq("slug", baseSlug))
    .unique();

  if (!existingBase) {
    return baseSlug;
  }
  // If base slug is taken, find the highest existing numeric suffix
  const existingWithPrefix = await ctx.db
    .query(args.table as TableNames)
    .withIndex("slug" as any, (q) =>
      q
        .gte("slug", `${baseSlug}-1`)
        .lt("slug", `${baseSlug}-${Number.MAX_SAFE_INTEGER}`)
    )
    .collect();

  // No numeric suffixes yet, use -1
  if (existingWithPrefix.length === 0) {
    return `${baseSlug}-1`;
  }

  // Find the highest numeric suffix
  let highestSuffix = 0;
  for (const event of existingWithPrefix) {
    const match = (event as any).slug.match(new RegExp(`^${baseSlug}-(\\d+)$`));
    if (match?.[1]) {
      const suffix = parseInt(match[1], 10);
      highestSuffix = Math.max(highestSuffix, suffix);
    }
  }

  return `${baseSlug}-${highestSuffix + 1}`;
}
