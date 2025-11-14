import { zid } from "convex-helpers/server/zod";
import z from "zod/v3";

export const frameworkSchema = z.enum([
  "expo",
  "nextjs",
  "tanstack-start",
  "react-vite",
  "remix",
]);

export const packageManagerSchema = z.enum(["bun", "npm", "pnpm", "yarn"]);

export const projectStatusSchema = z.enum(["create", "update", "delete", "creating", "updating", "deleting", "created", "updated", "deleted"]);

export const stepSchema = z.enum([
  "Initializing project", 
  "Installing framework",
  "Setting up Convex", 
  "Installing shadcn",
  "Configuring TypeScript",
]);

export const projectSchema = z.object({
  userId: zid("users"),
  name: z.string(),
  slug: z.string(),
  framework: frameworkSchema,
  packageManager: packageManagerSchema,
  status: projectStatusSchema,
  currentStep: stepSchema.optional()
});
