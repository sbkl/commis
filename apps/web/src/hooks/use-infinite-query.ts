"use client";

import type {
  PaginatedQueryArgs,
  PaginatedQueryReference,
  UsePaginatedQueryReturnType,
} from "convex/react";
import { usePaginatedQuery } from "convex/react";
import { getFunctionName } from "convex/server";
import * as React from "react";
import { proxy, useSnapshot } from "valtio";

type InfiniteQueryStore<Query extends PaginatedQueryReference> = Record<
  string,
  {
    queries: Record<string, UsePaginatedQueryReturnType<Query>>;
    lastKey: string | null;
    maxLoaded: number;
  }
>;

const store = proxy<InfiniteQueryStore<any>>({});

export function useInfiniteQuery<Query extends PaginatedQueryReference>(
  query: Query,
  args: PaginatedQueryArgs<Query>,
  {
    skipQuery,
    initialNumItems,
    initialData,
  }: {
    initialNumItems: number;
    skipQuery?: boolean;
    initialData?: UsePaginatedQueryReturnType<Query>["results"];
  }
) {
  const queryName = getFunctionName(query);

  const queryKey = JSON.stringify({ queryName, args });

  const state = React.useRef(store).current;
  const snap = useSnapshot(state);

  const maxLoaded = Math.max(snap[queryName]?.maxLoaded ?? initialNumItems);

  const paginatedQuery = usePaginatedQuery(query, skipQuery ? "skip" : args, {
    initialNumItems: maxLoaded,
  });

  const cachedQuery = (snap[queryName]?.queries[queryKey] ??
    (snap[queryName]?.lastKey
      ? snap[queryName]?.queries[snap[queryName]?.lastKey as string]
      : {
          results: [],
          status: "LoadingFirstPage",
          isLoading: true,
          loadMore: (_numItems: number) => {},
        })) as UsePaginatedQueryReturnType<Query>;

  // if (
  //   paginatedQuery.status !== "LoadingFirstPage" &&
  //   paginatedQuery.status !== "LoadingMore"
  // ) {
  //   const loaded = paginatedQuery.results.length;
  //   state[queryName] = {
  //     queries: state[queryName]
  //       ? {
  //           ...state[queryName].queries,
  //           [queryKey]: paginatedQuery,
  //         }
  //       : {
  //           [queryKey]: paginatedQuery,
  //         },
  //     lastKey: queryKey,
  //     maxLoaded: Math.max(loaded, state[queryName]?.maxLoaded ?? 0),
  //   };
  // }

  // Only update cache when not loading
  React.useEffect(() => {
    if (
      paginatedQuery.status !== "LoadingFirstPage" &&
      paginatedQuery.status !== "LoadingMore"
    ) {
      const loaded = paginatedQuery.results.length;
      state[queryName] = {
        queries: state[queryName]
          ? {
              ...state[queryName].queries,
              [queryKey]: paginatedQuery,
            }
          : {
              [queryKey]: paginatedQuery,
            },
        lastKey: queryKey,
        maxLoaded: Math.max(loaded, state[queryName]?.maxLoaded ?? 24),
      };
    }
    // Only run when paginatedQuery changes
  }, [paginatedQuery, queryName, queryKey, state]);

  const fetchNextPage = React.useCallback(() => {
    if (cachedQuery.status === "CanLoadMore") {
      paginatedQuery.loadMore(initialNumItems ?? 24);
    }
  }, [cachedQuery.status, paginatedQuery.loadMore, initialNumItems]);

  return {
    isPending: cachedQuery.status === "LoadingFirstPage",
    canLoadMore: cachedQuery.status === "CanLoadMore",
    isFetching: paginatedQuery.status === "LoadingFirstPage",
    isFetchingNextPage: paginatedQuery.status === "LoadingMore",
    queryStatus: paginatedQuery.status,
    cachedQueryStatus: cachedQuery.status,
    fetchNextPage,
    data:
      cachedQuery.status === "LoadingFirstPage"
        ? (initialData ?? [])
        : (cachedQuery.results ?? []),
  };
}
