// @ts-nocheck
"use client";

import type { UseQueryOptions } from "@tanstack/react-query";
import type {
  FunctionArgs,
  FunctionReference,
  FunctionReturnType,
} from "convex/server";

import { convexQuery } from "@convex-dev/react-query";
import { useQuery as useTanstackQuery } from "@tanstack/react-query";

export function useQuery<
  Query extends FunctionReference<"query">,
  Args extends FunctionArgs<Query> | "skip",
  ReturnType extends FunctionReturnType<Query>,
>(
  query: Query,
  args: Args,
  options?: Args extends "skip"
    ? Omit<
        UseQueryOptions<
          ReturnType,
          Error,
          ReturnType,
          ["convexQuery", Query, FunctionArgs<Query>]
        >,
        "queryKey" | "queryFn" | "staleTime" | "enabled"
      >
    : Omit<
        UseQueryOptions<
          ReturnType,
          Error,
          ReturnType,
          ["convexQuery", Query, FunctionArgs<Query>]
        >,
        "queryKey" | "queryFn" | "staleTime"
      >
) {
  return useTanstackQuery<ReturnType, Error, ReturnType>({
    ...(convexQuery(query, args) as unknown as UseQueryOptions<
      ReturnType,
      Error,
      ReturnType,
      readonly unknown[]
    >),
    ...((options ?? {}) as unknown as Omit<
      UseQueryOptions<ReturnType, Error, ReturnType, readonly unknown[]>,
      "queryKey" | "queryFn" | "staleTime"
    >),
  });
}
