import { z } from "zod/v3";

function requireEnv() {
  return {
    JWT_SECRET: z.string().parse(process.env["JWT_SECRET"]),
    SITE_URL: z.string().parse(process.env["SITE_URL"]),
  };
}

export const env = requireEnv();
