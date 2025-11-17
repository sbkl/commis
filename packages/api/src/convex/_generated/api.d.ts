/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as apiTokens_internal_action from "../apiTokens/internal/action.js";
import type * as apiTokens_internal_mutation from "../apiTokens/internal/mutation.js";
import type * as apiTokens_internal_query from "../apiTokens/internal/query.js";
import type * as apiTokens_mutation from "../apiTokens/mutation.js";
import type * as apiTokens_query from "../apiTokens/query.js";
import type * as apiTokens_table from "../apiTokens/table.js";
import type * as apiTokens_utils from "../apiTokens/utils.js";
import type * as auth from "../auth.js";
import type * as cliAuth_mutation from "../cliAuth/mutation.js";
import type * as cliAuth_query from "../cliAuth/query.js";
import type * as cliAuth_table from "../cliAuth/table.js";
import type * as codeFeatures_cli_query from "../codeFeatures/cli/query.js";
import type * as codeFeatures_internal_mutation from "../codeFeatures/internal/mutation.js";
import type * as codeFeatures_mutation from "../codeFeatures/mutation.js";
import type * as codeFeatures_query from "../codeFeatures/query.js";
import type * as codeFeatures_table from "../codeFeatures/table.js";
import type * as env from "../env.js";
import type * as functions from "../functions.js";
import type * as http from "../http.js";
import type * as projects_cli_mutation from "../projects/cli/mutation.js";
import type * as projects_cli_query from "../projects/cli/query.js";
import type * as projects_internal_action from "../projects/internal/action.js";
import type * as projects_internal_mutation from "../projects/internal/mutation.js";
import type * as projects_mutation from "../projects/mutation.js";
import type * as projects_query from "../projects/query.js";
import type * as projects_table from "../projects/table.js";
import type * as shared_internal_action from "../shared/internal/action.js";
import type * as shared_utils from "../shared/utils.js";
import type * as types_functions from "../types/functions.js";
import type * as uiComponents_cli_mutation from "../uiComponents/cli/mutation.js";
import type * as uiComponents_cli_query from "../uiComponents/cli/query.js";
import type * as uiComponents_internal_mutation from "../uiComponents/internal/mutation.js";
import type * as uiComponents_mutation from "../uiComponents/mutation.js";
import type * as uiComponents_table from "../uiComponents/table.js";
import type * as users_cli_mutation from "../users/cli/mutation.js";
import type * as users_cli_query from "../users/cli/query.js";
import type * as users_internal_query from "../users/internal/query.js";
import type * as users_mutation from "../users/mutation.js";
import type * as users_query from "../users/query.js";
import type * as users_table from "../users/table.js";
import type * as users_utils from "../users/utils.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "apiTokens/internal/action": typeof apiTokens_internal_action;
  "apiTokens/internal/mutation": typeof apiTokens_internal_mutation;
  "apiTokens/internal/query": typeof apiTokens_internal_query;
  "apiTokens/mutation": typeof apiTokens_mutation;
  "apiTokens/query": typeof apiTokens_query;
  "apiTokens/table": typeof apiTokens_table;
  "apiTokens/utils": typeof apiTokens_utils;
  auth: typeof auth;
  "cliAuth/mutation": typeof cliAuth_mutation;
  "cliAuth/query": typeof cliAuth_query;
  "cliAuth/table": typeof cliAuth_table;
  "codeFeatures/cli/query": typeof codeFeatures_cli_query;
  "codeFeatures/internal/mutation": typeof codeFeatures_internal_mutation;
  "codeFeatures/mutation": typeof codeFeatures_mutation;
  "codeFeatures/query": typeof codeFeatures_query;
  "codeFeatures/table": typeof codeFeatures_table;
  env: typeof env;
  functions: typeof functions;
  http: typeof http;
  "projects/cli/mutation": typeof projects_cli_mutation;
  "projects/cli/query": typeof projects_cli_query;
  "projects/internal/action": typeof projects_internal_action;
  "projects/internal/mutation": typeof projects_internal_mutation;
  "projects/mutation": typeof projects_mutation;
  "projects/query": typeof projects_query;
  "projects/table": typeof projects_table;
  "shared/internal/action": typeof shared_internal_action;
  "shared/utils": typeof shared_utils;
  "types/functions": typeof types_functions;
  "uiComponents/cli/mutation": typeof uiComponents_cli_mutation;
  "uiComponents/cli/query": typeof uiComponents_cli_query;
  "uiComponents/internal/mutation": typeof uiComponents_internal_mutation;
  "uiComponents/mutation": typeof uiComponents_mutation;
  "uiComponents/table": typeof uiComponents_table;
  "users/cli/mutation": typeof users_cli_mutation;
  "users/cli/query": typeof users_cli_query;
  "users/internal/query": typeof users_internal_query;
  "users/mutation": typeof users_mutation;
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
