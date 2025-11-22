// @ts-nocheck
import { ConvexError } from "convex/values";
import * as ConvexBase from "@/convex/_generated/server";
import type { DataModel } from "@/convex/_generated/dataModel";
import {
  type Rules,
  wrapDatabaseReader,
  wrapDatabaseWriter,
} from "convex-helpers/server/rowLevelSecurity";
import { Triggers } from "convex-helpers/server/triggers";
import {
  customAction,
  customCtx,
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";
import { findCurrentUser } from "@/convex/users/utils";

export const triggers = new Triggers<DataModel>();

async function rlsRules(ctx: ConvexBase.QueryCtx) {
  const user = await findCurrentUser(ctx);
  return {
    rules: {} satisfies Rules<ConvexBase.QueryCtx, DataModel>,
    user,
  };
}

export const publicQuery = customQuery(
  ConvexBase.query,
  customCtx(async (ctx: ConvexBase.QueryCtx) => {
    const { rules, user } = await rlsRules(ctx);
    return {
      ...ctx,
      db: wrapDatabaseReader(ctx, ctx.db, rules),
      user,
    };
  })
);

export const protectedQuery = customQuery(
  ConvexBase.query,
  customCtx(async (ctx: ConvexBase.QueryCtx) => {
    const { rules, user } = await rlsRules(ctx);
    if (!user) {
      throw new ConvexError("Unauthorized");
    }
    return {
      ...ctx,
      db: wrapDatabaseReader(ctx, ctx.db, rules),
      user,
    };
  })
);

export const internalQuery = customQuery(
  ConvexBase.internalQuery,
  customCtx(async (ctx) => {
    const { rules } = await rlsRules(ctx);
    return {
      db: wrapDatabaseReader(ctx, ctx.db, rules),
    };
  })
);

export const publicMutation = customMutation(
  ConvexBase.mutation,
  customCtx(async (ctx: ConvexBase.MutationCtx) => {
    const withTriggersCtx = triggers.wrapDB(ctx);
    const { rules, user } = await rlsRules(withTriggersCtx);
    return {
      db: wrapDatabaseWriter(withTriggersCtx, withTriggersCtx.db, rules),
      user,
    };
  })
);

export const protectedMutation = customMutation(
  ConvexBase.mutation,
  customCtx(async (ctx: ConvexBase.MutationCtx) => {
    const withTriggersCtx = triggers.wrapDB(ctx);
    const { rules, user } = await rlsRules(withTriggersCtx);
    if (!user) {
      throw new ConvexError("Unauthorized");
    }
    return {
      db: wrapDatabaseWriter(withTriggersCtx, withTriggersCtx.db, rules),
      user,
    };
  })
);

export const internalMutation = customMutation(
  ConvexBase.internalMutation,
  customCtx(async (ctx: ConvexBase.MutationCtx) => {
    const withTriggersCtx = triggers.wrapDB(ctx);
    const { rules } = await rlsRules(withTriggersCtx);
    return {
      db: wrapDatabaseWriter(withTriggersCtx, withTriggersCtx.db, rules),
    };
  })
);

export const publicAction = customAction(
  ConvexBase.action,
  customCtx(async (ctx: ConvexBase.ActionCtx) => {
    const user = await findCurrentUser(ctx);
    return {
      user,
    };
  })
);

export const protectedAction = customAction(
  ConvexBase.action,
  customCtx(async (ctx: ConvexBase.ActionCtx) => {
    const user = await findCurrentUser(ctx);
    if (!user) throw new ConvexError("Unauthorized");
    return {
      user,
    };
  })
);

export const internalAction = customAction(
  ConvexBase.internalAction,
  customCtx(async () => ({}))
);
