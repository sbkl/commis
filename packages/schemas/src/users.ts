import { zid } from "convex-helpers/server/zod4";
import { z } from "zod";

export const userSchema = z.object({
  name: z.string().optional(),
  firstName: z.union([z.string(), z.null()]).optional(),
  lastName: z.union([z.string(), z.null()]).optional(),
  image: z.union([z.string(), z.null()]).optional(),
  email: z.string().optional(),
  emailVerified: z.boolean().optional(),
  emailVerificationTime: z.number().optional(),
  isAnonymous: z.boolean().optional(),
  deactivatedAt: z.number().optional(),
});

export const userWorkingDirectorySchema = z.object({
  userId: zid("users"),
  device: z.string(),
  directory: z.string(),
});

export const userConfigSchema = z.object({
  userId: zid("users"),
  convexTeamSlug: z.string(),
  convexTeamId: z.number(),
  convexAccessToken: z.string(),
});