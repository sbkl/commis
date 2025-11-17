import { zid } from "convex-helpers/server/zod";
import { z } from "zod/v3";

export const uiComponentStatusSchema = z.enum(["pending", "installing", "installed", "failed"]);

export const uiComponentVendorSchema = z.enum(["shadcn"]);

export const uiComponentSchema = z.object({  
  name: z.string(),
  label: z.string(),
  vendor: uiComponentVendorSchema,
});

export const uiComponentOnProjectSchema = z.object({
  projectId: zid("projects"),
  userId: zid("users"),
  uiComponentId: zid("uiComponents"),
  status: uiComponentStatusSchema,
});