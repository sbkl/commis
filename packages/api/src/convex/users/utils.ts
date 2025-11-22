import { ConvexError } from "convex/values";
import type { ActionCtx, QueryCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "../_generated/api";

function isActionCtx(ctx: QueryCtx | ActionCtx): ctx is ActionCtx {
  return "runMutation" in ctx;
}

export async function findUserById(
  ctx: QueryCtx,
  userId: Id<"users">
): Promise<UserWithConfig> {
  const user = await ctx.db.get(userId);
  if (!user) {
    return null;
  }
  const config = await ctx.db
    .query("userConfigs")
    .withIndex("userId", (q) => q.eq("userId", userId))
    .unique();

  return {
    ...user,
    config,
  };
}

type UserWithConfig =
  | (Doc<"users"> & {
      config: Doc<"userConfigs"> | null;
    })
  | null;

export async function findCurrentUser(
  ctx: ActionCtx | QueryCtx
): Promise<UserWithConfig> {
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
): Promise<NonNullable<UserWithConfig>> {
  const userRecord = await findCurrentUser(ctx);
  if (!userRecord) throw new ConvexError("Authentication required");
  return userRecord;
}
