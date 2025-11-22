// @ts-nocheck
import { ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { ActionCtx, QueryCtx } from "@/convex/_generated/server";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { internal } from "@/convex/_generated/api";

function isActionCtx(ctx: QueryCtx | ActionCtx): ctx is ActionCtx {
  return "runMutation" in ctx;
}

export async function findUserById(
  ctx: QueryCtx,
  userId: Id<"users">
): Promise<Doc<"users"> | null> {
  // Here you can add additional info about the user if needed like profile, roles, etc.
  // So it is shared with all functions fetching the user.
  return await ctx.db.get(userId);
}

export async function findCurrentUser(
  ctx: ActionCtx | QueryCtx
): Promise<Doc<"users"> | null> {
  const userId = await getAuthUserId(ctx);
  if (userId) {
    if (isActionCtx(ctx)) {
      return await ctx.runQuery(internal.users.internal.query.findById, {
        userId,
      });
    } else {
      return await findUserById(ctx, userId);
    }
  }
  return null;
}

export async function getCurrentUser(
  ctx: ActionCtx | QueryCtx
): Promise<NonNullable<Doc<"users">>> {
  const userRecord = await findCurrentUser(ctx);
  if (!userRecord) throw new ConvexError("Authentication required");
  return userRecord;
}
