import { client } from "../client";
import { api } from "@commis/api/src/convex/_generated/api";
import {
  getAuthToken,
  getRefreshToken,
  setTokens,
  clearAuthToken,
} from "./config";
import type {
  FunctionArgs,
  FunctionReference,
  FunctionReturnType,
} from "convex/server";

/**
 * Wrapper that automatically handles token refresh for any operation
 * @param operation - The operation to execute (query/mutation)
 * @returns The result of the operation
 */
async function withTokenRefresh<T>(
  operation: (token: string) => Promise<T>
): Promise<T> {
  let token = await getAuthToken();
  const refreshToken = await getRefreshToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  try {
    // Try the operation with current token
    return await operation(token);
  } catch (error) {
    // Operation failed, try to refresh token
    if (refreshToken) {
      try {
        const refreshResult = await mutation(
          api.cliAuth.mutation.refreshAccessToken,
          { refreshToken }
        );

        // Save BOTH new tokens (refresh token rotation)
        await setTokens(refreshResult.token, refreshResult.refreshToken);

        // Retry the operation with new token
        return await operation(refreshResult.token);
      } catch (refreshError) {
        // Refresh failed, clear tokens
        await clearAuthToken();
        throw new Error("Not authenticated");
      }
    }

    // No refresh token available, clear tokens
    await clearAuthToken();
    throw new Error("Not authenticated");
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  return query(api.apiTokens.query.verifyToken, {});
}

export async function query<
  Query extends FunctionReference<"query">,
  Args extends Omit<FunctionArgs<Query>, "token">,
>(query: Query, args: Args): Promise<FunctionReturnType<Query>> {
  return withTokenRefresh(async (token) => {
    return await client.query(query, {
      token,
      ...args,
    });
  });
}

export async function mutation<
  Mutation extends FunctionReference<"mutation">,
  Args extends Omit<FunctionArgs<Mutation>, "token">,
>(mutation: Mutation, args: Args): Promise<FunctionReturnType<Mutation>> {
  return withTokenRefresh(async (token) => {
    return await client.mutation(mutation, {
      token,
      ...args,
    });
  });
}

export async function onQueryUpdate<
  Query extends FunctionReference<"query">,
  Args extends Omit<FunctionArgs<Query>, "token">,
>(
  query: Query,
  args: Args,
  callback: (value: FunctionReturnType<Query>) => void
): Promise<ReturnType<typeof client.onUpdate<Query>>> {
  return withTokenRefresh(async (token) => {
    return client.onUpdate(
      query,
      {
        token,
        ...args,
      },
      callback
    );
  });
}

/**
 * Require authentication or exit
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    console.error("❌ Not authenticated. Please run 'commis login' first.\n");
    process.exit(1);
  }

  return user;
}

/**
 * Execute an authenticated query with automatic token refresh
 *
 * Example:
 * ```ts
 * const projects = await authenticatedQuery((token) =>
 *   client.query(api.projects.cli.query.list, { token })
 * );
 * ```
 */
export async function authenticatedQuery<T>(
  queryFn: (token: string) => Promise<T>
): Promise<T> {
  const result = await withTokenRefresh(queryFn);

  if (result === null) {
    console.error("❌ Not authenticated. Please run 'commis login' first.\n");
    process.exit(1);
  }

  return result;
}

/**
 * Execute an authenticated mutation with automatic token refresh
 *
 * Example:
 * ```ts
 * const project = await authenticatedMutation((token) =>
 *   client.mutation(api.projects.mutation.create, {
 *     token,
 *     slug: "my-project",
 *     name: "My Project"
 *   })
 * );
 * ```
 */
export async function authenticatedMutation<T>(
  mutationFn: (token: string) => Promise<T>
): Promise<T> {
  const result = await withTokenRefresh(mutationFn);

  if (result === null) {
    console.error("❌ Not authenticated. Please run 'commis login' first.\n");
    process.exit(1);
  }

  return result;
}

/**
 * Get the current auth token or exit
 * Useful for passing to multiple queries/mutations
 */
export async function requireAuthToken(): Promise<string> {
  const token = await getAuthToken();

  if (!token) {
    console.error("❌ Not authenticated. Please run 'commis login' first.\n");
    process.exit(1);
  }

  return token;
}
