"use client";

import type {
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import type {
  FunctionArgs,
  FunctionReference,
  FunctionReturnType,
} from "convex/server";

import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation as useTanstackMutation } from "@tanstack/react-query";

export function useMutation<
  Mutation extends FunctionReference<"mutation">,
  Args extends FunctionArgs<Mutation>,
  ReturnType extends FunctionReturnType<Mutation>,
>(
  mutation: Mutation,
  options?: Omit<UseMutationOptions<ReturnType, Error, Args>, "mutationFn">
): UseMutationResult<ReturnType, Error, Args> {
  const convexMutation = useConvexMutation(mutation);
  return useTanstackMutation<ReturnType, Error, Args>({
    mutationFn: (args) => convexMutation(args),
    ...(options ?? {}),
  });
}
