"use client";

import * as React from "react";

import { useCombinedRefs } from "@commis/ui/hooks/use-combined-refs";
import { useEventListener } from "@commis/ui/hooks/use-event-listener";
import { useMeasure } from "@commis/ui/hooks/use-measure";
import { useObserver } from "@commis/ui/hooks/use-observer";
import { useResponsiveColumns } from "@commis/ui/hooks/use-responsive-columns";
import { chunk } from "@commis/ui/lib/chunk";
import { getCSSVariable } from "@commis/ui/lib/get-css-variable";
import { useVirtualizer } from "@tanstack/react-virtual";

import { Spinner } from "@commis/ui/components/spinner";
import { useMediaQuery } from "@commis/ui/hooks/use-media-query";
import { cn } from "@commis/ui/lib/utils";
import { ScrollArea } from "@commis/ui/components/scroll-area";
import { useIsMounted } from "@commis/ui/hooks/use-is-mounted";

type ItemProps<ItemType> = {
  item: ItemType;
  index: number;
};

type RenderFunction<ItemType> = (
  info: ItemProps<ItemType> & { estimateSize: number }
) => React.ReactNode;

type FlatListBaseProps<TItem> = {
  gap?: number;
  gapY?: number;
  gapX?: number;
  keyExtractor?: (item: TItem, index: number) => string;
  renderItem: RenderFunction<TItem>;
  paddingStart?: number;
  paddingEnd?: number;
  estimateSize: number | ((index: number) => number);
  overscan?: number;
  columnWidth?: number;
  numColumns?: number;
  initialLoadingState?: React.ReactNode;
  emptyState?: React.ReactNode;
  placeholder?: React.ReactNode;
  rowContainerClassName?: string;
  safeTop?: boolean;
  search?: {
    onSearch: (value: string | undefined) => void;
    defaultValue: string | undefined;
    pending: boolean;
    hasActiveQuery: boolean;
  };
  hasSecondarySidebar?: boolean;
  minColumns?: number;
  sidebarOpen?: boolean;
  additionalOffset?: number;
  headerGap?: number;
  viewportClassName?: string;
  header?:
    | React.ReactNode
    | ((props: { listWidth: number }) => React.ReactNode);
  headerHeight?: number;
  headerSticky?: boolean;
};

interface FlatListProps<TItem>
  extends FlatListBaseProps<TItem>,
    React.ComponentProps<typeof ScrollArea> {
  data: TItem[];
  actions?: React.ReactNode;
  isPending?: boolean;
  hasMore?: boolean;
  fetchNextPage?: () => void;
  fetchingMore?: boolean;
  loadMoreThreshold?: number;
}

function getFlatIndex<T>(
  rowIndex: number,
  itemIndex: number,
  array: T[][]
): number {
  if (rowIndex < 0 || rowIndex >= array.length) {
    throw new Error("Invalid row index");
  }

  const parentArray = array[rowIndex];

  if (
    !Array.isArray(parentArray) ||
    itemIndex < 0 ||
    itemIndex >= parentArray.length
  ) {
    throw new Error("Invalid item index");
  }

  // Sum the lengths of all preceding rows
  let totalItems = 0;
  for (let i = 0; i < rowIndex; i++) {
    totalItems += array[i]?.length ?? 0;
  }

  // Add the item index within the current row
  return totalItems + itemIndex;
}

export function FlatList<TItem>({
  data,
  gap,
  gapY,
  gapX,
  columnWidth,
  numColumns,
  minColumns = 1,
  hasSecondarySidebar,
  renderItem,
  keyExtractor,
  fetchNextPage,
  fetchingMore,
  estimateSize,
  paddingStart,
  paddingEnd,
  overscan = 5,
  className,
  style,
  initialLoadingState,
  emptyState,
  placeholder,
  isPending,
  hasMore,
  rowContainerClassName,
  safeTop = true,
  ref,
  search,
  actions,
  sidebarOpen,
  loadMoreThreshold = 1,
  additionalOffset,
  headerGap,
  viewportClassName,
  header,
  headerHeight,
  headerSticky = true,
  ...props
}: FlatListProps<TItem>) {
  const { columnCount, newColumnWidth, newContainerWidth } =
    useResponsiveColumns({
      columnWidth,
      gapX,
      gap,
      numColumns,
      minColumns,
      hasSecondarySidebar,
      sidebarOpen,
      additionalOffset,
    });

  const sentinelRef = useObserver({
    fetchingMore,
    hasMore,
    fetchMore: fetchNextPage,
  });

  const listRef = ref
    ? useCombinedRefs(ref)
    : React.useRef<HTMLDivElement>(null);

  const viewportRef = React.useRef<HTMLDivElement>(null);

  const { ref: measureRef } = useMeasure<HTMLUListElement>();

  const isMobile = useMediaQuery("(max-width: 639px)");

  const mounted = useIsMounted();

  const dataChunks = chunk([...(data ?? [])], { chunkSize: columnCount });

  const calculatedEstimateSize = React.useCallback(
    (index: number) => {
      return typeof estimateSize === "number"
        ? estimateSize + (gapY ?? gap ?? 0)
        : estimateSize(index) + (gapY ?? gap ?? 0);
    },
    [estimateSize, gapY, gap]
  );

  const virtualizer = useVirtualizer({
    count: dataChunks.length,
    estimateSize: calculatedEstimateSize,
    overscan,
    paddingStart: (headerGap ?? gapY ?? gap ?? 0) + (paddingStart ?? 0),
    // + (safeTop ? parseInt(getCSSVariable("--safe-top")) : 0),
    paddingEnd: (paddingEnd ?? 0) + parseInt(getCSSVariable("--safe-bottom")),
    getScrollElement: () => viewportRef.current,
  });

  useEventListener("resize", () => {
    if (viewportRef.current) {
      virtualizer.measure();
    }
  });

  React.useEffect(() => {
    virtualizer.measure();
  }, [estimateSize]);

  const virtualItems = virtualizer.getVirtualItems();

  const [initialListSize, setInitialListSize] = React.useState(0);

  React.useEffect(() => {
    if (initialListSize === 0 && dataChunks.length > 0) {
      setInitialListSize(virtualizer.getTotalSize());
    }
  }, [dataChunks.length]);

  // Calculate skeleton items for loading state
  const calculateSkeletonItems = React.useCallback(() => {
    if (!viewportRef.current || !mounted) return [];

    const viewportHeight = viewportRef.current.clientHeight;
    const itemHeight =
      typeof estimateSize === "number" ? estimateSize : estimateSize(0);
    const rowHeight = itemHeight + (gapY ?? gap ?? 0);
    const visibleRows = Math.ceil(viewportHeight / rowHeight) + 2; // Extra for good measure
    const totalItems = visibleRows * columnCount;

    return Array.from({ length: totalItems }, (_, i) => ({
      id: `skeleton-${i}`,
    }));
  }, [viewportRef, mounted, estimateSize, gapY, gap, columnCount]);

  const skeletonItems = React.useMemo(
    () => calculateSkeletonItems(),
    [calculateSkeletonItems]
  );

  console.log(virtualizer.getTotalSize());
  return (
    <ScrollArea
      ref={listRef}
      viewportRef={viewportRef}
      viewportClassName={viewportClassName}
      className={cn("h-full w-full", className)}
      style={style}
      {...props}
    >
      {header && headerHeight ? (
        <div
          className={cn("w-full", headerSticky && "sticky top-0 z-10")}
          style={{
            height: headerHeight,
          }}
        >
          {typeof header === "function"
            ? header({ listWidth: newContainerWidth })
            : header}
        </div>
      ) : null}
      {isPending ? (
        <ul
          ref={measureRef}
          className={cn("relative sm:mx-auto list-none m-0 p-0")}
          style={{
            paddingTop: headerGap ?? gapY ?? gap ?? 0,
            width:
              newContainerWidth && mounted() && !(isMobile || columnCount === 1)
                ? `${newContainerWidth}px`
                : "100vw",
          }}
        >
          {mounted() && skeletonItems.length > 0 ? (
            <ul
              className={cn(
                "grid w-full list-none m-0 p-0",
                rowContainerClassName
              )}
              style={{
                gap: `${gapY ?? gap ?? 0}px ${gapX ?? gap ?? 0}px`,
                gridTemplateColumns:
                  isMobile || columnCount === 1
                    ? "1fr"
                    : `repeat(${columnCount}, ${newColumnWidth ? `${newColumnWidth}px` : "1fr"})`,
              }}
            >
              {skeletonItems.map((_, index) => {
                const itemHeight =
                  typeof estimateSize === "number"
                    ? estimateSize
                    : estimateSize(0);
                return (
                  <li
                    key={`skeleton-${index}`}
                    style={{ height: `${itemHeight}px` }}
                  >
                    {initialLoadingState}
                  </li>
                );
              })}
            </ul>
          ) : null}
        </ul>
      ) : !isPending && !data?.length ? (
        !search?.hasActiveQuery ? (
          <ul
            ref={measureRef}
            className={cn("relative sm:mx-auto list-none m-0 p-0")}
            style={{
              paddingTop: headerGap ?? gapY ?? gap ?? 0,
              width:
                newContainerWidth &&
                mounted() &&
                !(isMobile || columnCount === 1)
                  ? `${newContainerWidth}px`
                  : "100vw",
            }}
          >
            {emptyState}
          </ul>
        ) : (
          <div className="relative flex w-full flex-col px-6 lg:mx-auto lg:max-w-4xl xl:max-w-7xl">
            {/* empty state when no record found via the search query */}
            <div className="mx-auto w-full max-w-md pt-24">
              <h1 className="mb-4 text-2xl font-bold">No results found</h1>
              <p className="mb-6 text-lg">Try searching for something else.</p>
            </div>
          </div>
        )
      ) : (
        <ul
          ref={measureRef}
          className={cn("relative sm:mx-auto list-none m-0 p-0")}
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width:
              newContainerWidth && mounted() && !(isMobile || columnCount === 1)
                ? `${newContainerWidth}px`
                : "100vw",
          }}
        >
          {virtualItems.map((virtualRow) => {
            const row = dataChunks[virtualRow.index];
            if (!row) return null;
            return (
              <div
                key={virtualRow.index}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${
                    virtualRow.start - virtualizer.options.scrollMargin
                  }px)`,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: `${gapY ?? gap ?? 0}px ${gapX ?? gap ?? 0}px`,
                }}
                className={cn(rowContainerClassName)}
              >
                {row.map((item, itemRowIndex) => {
                  const itemIndex = getFlatIndex(
                    virtualRow.index,
                    itemRowIndex,
                    dataChunks
                  );
                  return (
                    <li
                      key={
                        keyExtractor
                          ? keyExtractor(item, itemIndex)
                          : itemIndex.toString()
                      }
                      style={{
                        width:
                          isMobile || columnCount === 1
                            ? "100%"
                            : newColumnWidth
                              ? `${newColumnWidth}px`
                              : `${100 / columnCount}%`,
                        height: `${typeof estimateSize === "number" ? estimateSize : estimateSize(itemRowIndex)}px`,
                        flexShrink: 0,
                      }}
                    >
                      {renderItem({
                        item,
                        index: itemIndex,
                        estimateSize: calculatedEstimateSize(itemRowIndex),
                      })}
                    </li>
                  );
                })}
                {/* missing items */}
                {row.length < columnCount && placeholder
                  ? Array.from({ length: columnCount - row.length }).map(
                      (_, i) => {
                        return (
                          <li
                            key={`placeholder-${i}`}
                            style={{
                              width:
                                isMobile || columnCount === 1
                                  ? "100%"
                                  : newColumnWidth
                                    ? `${newColumnWidth}px`
                                    : `${100 / columnCount}%`,
                              height: `${typeof estimateSize === "number" ? estimateSize : estimateSize(0)}px`,
                              flexShrink: 0,
                            }}
                          >
                            {placeholder}
                          </li>
                        );
                      }
                    )
                  : null}
              </div>
            );
          })}
          {typeof data != "undefined" && virtualItems.length > 0 ? (
            <div
              ref={sentinelRef}
              className="pointer-events-none absolute z-50 size-px bg-transparent"
              style={{
                bottom: `${(initialListSize / 2) * loadMoreThreshold}px`,
              }}
            />
          ) : null}
          {fetchingMore ? (
            <div className="absolute inset-x-0 bottom-6 flex items-center justify-center">
              <Spinner className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : null}
        </ul>
      )}
    </ScrollArea>
  );
}
