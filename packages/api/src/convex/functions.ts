import {
  type Rules,
  wrapDatabaseReader,
  wrapDatabaseWriter,
} from "convex-helpers/server/rowLevelSecurity";
import { ConvexError, v } from "convex/values";
import { Triggers } from "convex-helpers/server/triggers";
import type { DataModel, Doc } from "./_generated/dataModel";
import * as VanillaConvex from "./_generated/server";
import * as ConvexBase from "./_generated/server";
import { getActCurrentUser, getCurrentUser } from "./users/utils";
import {
  customAction,
  customCtx,
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";
import { hashToken } from "./apiTokens/utils";

export const triggers = new Triggers<DataModel>();

async function rlsRules(ctx: ConvexBase.QueryCtx) {
  const user = await getCurrentUser(ctx);
  return {
    rules: {} satisfies Rules<ConvexBase.QueryCtx, DataModel>,
    user,
  };
}

export const cliProtectedQuery = customQuery(ConvexBase.query, {
  args: {
    token: v.optional(v.string()),
  },
  async input(ctx, args) {
    if (!args.token) {
      throw new ConvexError("Token is required");
    }

    // Hash the token and verify it against the database

    const tokenHash = await hashToken(args.token);

    const apiToken = await ctx.db
      .query("apiTokens")
      .withIndex("token", (q) => q.eq("token", tokenHash))
      .first();

    if (!apiToken) {
      throw new ConvexError("Invalid or expired token");
    }

    // Check if token is expired (if expiresAt is set)
    if (apiToken.expiresAt && apiToken.expiresAt < Date.now()) {
      throw new ConvexError("Token has expired");
    }

    const user = await ctx.db.get(apiToken.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    return {
      ctx: {
        ...ctx,
        user,
        apiToken,
      },
      args,
    };
  },
});

export const cliProtectedMutation = customMutation(ConvexBase.mutation, {
  args: {
    token: v.optional(v.string()),
  },
  async input(ctx, args) {
    if (!args.token) {
      throw new ConvexError("Token is required");
    }

    // Hash the token and verify it against the database

    const tokenHash = await hashToken(args.token);

    const apiToken = await ctx.db
      .query("apiTokens")
      .withIndex("token", (q) => q.eq("token", tokenHash))
      .first();

    if (!apiToken) {
      throw new ConvexError("Invalid or expired token");
    }

    // Check if token is expired (if expiresAt is set)
    if (apiToken.expiresAt && apiToken.expiresAt < Date.now()) {
      throw new ConvexError("Token has expired");
    }

    const user = await ctx.db.get(apiToken.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    // Update last used timestamp
    await ctx.db.patch(apiToken._id, {
      lastUsedAt: Date.now(),
    });

    return {
      ctx: {
        ...ctx,
        user,
        apiToken,
      },
      args,
    };
  },
});

export const publicQuery = customQuery(
  VanillaConvex.query,
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
  customCtx(async (ctx: ConvexBase.QueryCtx) => {
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
    const user = (await getActCurrentUser(ctx)) as Doc<"users"> | null;
    return {
      user,
    };
  })
);

export const protectedAction = customAction(
  ConvexBase.action,
  customCtx(async (ctx: ConvexBase.ActionCtx) => {
    const user = (await getActCurrentUser(ctx)) as Doc<"users"> | null;
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
