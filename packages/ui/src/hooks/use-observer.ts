import * as React from "react";

interface UseObserverProps {
  hasMore?: boolean;
  fetchingMore?: boolean;
  fetchMore?(): void;
}

export function useObserver({
  hasMore,
  fetchMore,
  fetchingMore,
}: UseObserverProps) {
  const sentinelRef = React.useRef(null);
  const onSentinelIntersection = React.useCallback(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && hasMore && !fetchingMore && fetchMore) {
          fetchMore();
        }
      });
    },
    [fetchingMore, fetchMore, hasMore]
  );

  React.useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(onSentinelIntersection);
    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }
    return () => {
      observer.disconnect();
    };
  }, [hasMore, onSentinelIntersection, sentinelRef]);

  return sentinelRef;
}
