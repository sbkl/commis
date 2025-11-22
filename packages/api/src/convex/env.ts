import { z } from "zod";

function requireEnv() {
  return {
    SITE_URL: z.string().parse(process.env["SITE_URL"]),
  };
}

export const env = requireEnv();
