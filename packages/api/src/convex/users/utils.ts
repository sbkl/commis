import { ConvexError } from "convex/values";
import type { ActionCtx, QueryCtx, MutationCtx } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "../_generated/api";

export async function getUserIdFromApiToken(ctx: QueryCtx | MutationCtx) {
  // Check if there's an API token in the auth
  // Convex Auth stores the token, but we need to check if it's an API token
  // We'll try to look up the token in our apiTokens table
  try {
    // Get all API tokens and check if any match the current auth
    const authTokenValue = await getAuthUserId(ctx);
    if (authTokenValue) {
      return authTokenValue;
    }

    // If no standard auth, this might be an API token
    // We'll need to check the request context for a custom token
    // For now, return null - API tokens will be validated separately
    return null;
  } catch {
    return null;
  }
}

export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  // First try standard OAuth authentication
  const userId = await getAuthUserId(ctx);
  if (userId) {
    return await ctx.db.get(userId);
  }

  // If no OAuth user, return null
  // Note: API token auth will be handled via separate mechanisms
  return null;
}

export async function getActCurrentUser(ctx: ActionCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    return null;
  }
  return await ctx.runQuery(internal.users.internal.query.findById, {
    userId,
  });
}

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx);
  if (!userRecord) throw new ConvexError("Authentication required");
  return userRecord;
}
