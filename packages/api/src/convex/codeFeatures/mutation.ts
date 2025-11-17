import { v } from "convex/values";
import { protectedMutation } from "../functions";
import { CodeFeatureFiles, CodeFeatures } from "./table";
import { generateSlug } from "../shared/utils";

export const create = protectedMutation({
  args: {
    ...CodeFeatures.withoutSystemFields,
    files: v.array(
      v
        .object({
          ...CodeFeatureFiles.withoutSystemFields,
        })
        .omit("codeFeatureId")
    ),
  },
  async handler(ctx, { files, ...feature }) {
    const slug = await generateSlug(ctx, {
      value: feature.name,
      table: "codeFeatures",
    });

    const featureId = await ctx.db.insert("codeFeatures", {
      ...feature,
      userId: ctx.user._id,
      slug,
    });

    for (const file of files) {
      await ctx.db.insert("codeFeatureFiles", {
        ...file,
        codeFeatureId: featureId,
      });
    }

    return featureId;
  },
});
