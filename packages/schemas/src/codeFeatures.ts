import { zid } from "convex-helpers/server/zod";
import { z } from "zod/v3";

export const codeFeatureSchema = z.object({
  userId: zid("users"),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  isPublic: z.boolean(),
  tags: z.array(z.string()),
  dependencies: z.record(z.string(), z.string()),
  version: z.string(),
});

export const languageSchema = z.enum(["typescript", "javascript", "css", "html", "json", "markdown"]);

export const codeFeatureFileSchema = z.object({
  codeFeatureId: zid("codeFeatures"),
  path: z.string(),
  content: z.string(),
  language: languageSchema,
});
