/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as functions from "../functions.js";
import type * as http from "../http.js";
import type * as projects_mutation from "../projects/mutation.js";
import type * as projects_query from "../projects/query.js";
import type * as projects_table from "../projects/table.js";
import type * as shared_utils from "../shared/utils.js";
import type * as types_functions from "../types/functions.js";
import type * as users_internal_query from "../users/internal/query.js";
import type * as users_query from "../users/query.js";
import type * as users_table from "../users/table.js";
import type * as users_utils from "../users/utils.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  functions: typeof functions;
  http: typeof http;
  "projects/mutation": typeof projects_mutation;
  "projects/query": typeof projects_query;
  "projects/table": typeof projects_table;
  "shared/utils": typeof shared_utils;
  "types/functions": typeof types_functions;
  "users/internal/query": typeof users_internal_query;
  "users/query": typeof users_query;
  "users/table": typeof users_table;
  "users/utils": typeof users_utils;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
