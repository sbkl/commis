import { zid } from "convex-helpers/server/zod4";
import z from "zod";

export const frameworkSchema = z.enum([
  "expo",
  "nextjs",
  "tanstack-start",
  "react-vite",
  "remix",
]);

export const packageManagerSchema = z.enum(["bun", "npm", "pnpm", "yarn"]);

export const projectStatusSchema = z.enum(["init", "create", "update", "delete", "creating", "updating", "deleting", "created", "updated", "deleted"]);

export const stepSchema = z.enum([
  "Creating Convex project",
  "Initializing local project", 
  "Installing framework dependencies",
  "Syncing project with Convex", 
  "Setting up shadcn/ui",
  "Configuring TypeScript",
]);

export const projectSchema = z.object({
  userId: zid("users"),
  name: z.string(),
  slug: z.string(),
  framework: frameworkSchema,
  packageManager: packageManagerSchema,
  status: projectStatusSchema,
  currentStep: stepSchema.optional(),
  convexSlug: z.string().optional(),
  convexTeamId: z.number().optional(),
  convexTeamSlug: z.string().optional(),
  convexDeploymentName: z.string().optional(),
  convexDeploymentUrl: z.string().optional(),
  convexProjectId: z.number().optional(),
  adminKey: z.string().optional(),
});
