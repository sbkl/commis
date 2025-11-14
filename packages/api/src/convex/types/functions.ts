import type { Env, ValidationTargets } from "hono";
import type { ActionCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import {
  internalAction,
  internalMutation,
  internalQuery,
  protectedAction,
  protectedMutation,
  protectedQuery,
  publicAction,
  publicMutation,
  publicQuery,
} from "../functions";
import type { CustomCtx } from "convex-helpers/server/customFunctions";

export type PublicQueryCtx = CustomCtx<typeof publicQuery>;
export type ProtectedQueryCtx = CustomCtx<typeof protectedQuery>;
export type InternalQueryCtx = CustomCtx<typeof internalQuery>;

export type PublicMutationCtx = CustomCtx<typeof publicMutation>;
export type ProtectedMutationCtx = CustomCtx<typeof protectedMutation>;
export type InternalMutationCtx = CustomCtx<typeof internalMutation>;

export type PublicActionCtx = CustomCtx<typeof publicAction>;
export type ProtectedActionCtx = CustomCtx<typeof protectedAction>;
export type InternalActionCtx = CustomCtx<typeof internalAction>;

export type HttpActionCtx = {
  Bindings: ActionCtx & Env;
  Variables: {
    user?: Doc<"users"> | undefined;
  };
  ValidationTargets: ValidationTargets;
};
