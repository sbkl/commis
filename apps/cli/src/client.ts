import { ConvexClient } from "convex/browser";

if (!process.env["CONVEX_URL"]) {
  console.error("❌ Missing CONVEX_URL environment variable");
  console.error("");
  console.error("Please create a .env file with your Convex URL:");
  console.error("  CONVEX_URL=https://your-deployment.convex.cloud");
  console.error("");
  console.error(
    "You can find your Convex URL at: https://dashboard.convex.dev"
  );
  process.exit(1);
}

/**
 * Convex client for the CLI.
 *
 * NOTE: Do NOT use client.setAuth() for API tokens!
 * - client.setAuth() is for Convex Auth JWT tokens (GitHub OAuth, Google, etc.)
 * - Our API tokens are custom database tokens, not JWTs
 * - Always pass API tokens as arguments to CLI queries/mutations
 */
export const client = new ConvexClient(process.env["CONVEX_URL"]!);
