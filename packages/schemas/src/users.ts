import { z } from "zod/v3";

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
