/**
 * @module use-infinite-scroll
 *
 * IntersectionObserver-based infinite scroll hook.
 * Compatible with TanStack Query's useInfiniteQuery.
 *
 * Usage:
 *   const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
 *     useInfiniteQuery({ queryKey, queryFn, getNextPageParam });
 *
 *   const sentinelRef = useInfiniteScroll({
 *     onLoadMore: fetchNextPage,
 *     hasMore: !!hasNextPage,
 *     isLoading: isFetchingNextPage,
 *   });
 *
 *   return <div ref={sentinelRef} aria-hidden="true" />;
 */
"use client";

import { useCallback, useEffect, useRef } from "react";

export interface UseInfiniteScrollOptions {
  /** Called when the sentinel enters the viewport and more items are available. */
  onLoadMore: () => void;
  /** Whether more pages are available. */
  hasMore: boolean;
  /** Suppresses trigger while a page is already loading. */
  isLoading?: boolean;
  /**
   * Root margin for the IntersectionObserver.
   * Increase to trigger loading earlier (e.g. "200px" = load 200px before sentinel).
   * @default "0px"
   */
  rootMargin?: string;
  /**
   * Intersection threshold.
   * @default 0
   */
  threshold?: number;
}

/**
 * Returns a ref to attach to a sentinel element at the bottom of a list.
 * When the sentinel becomes visible, `onLoadMore` is called automatically.
 */
export function useInfiniteScroll<T extends HTMLElement = HTMLDivElement>({
  onLoadMore,
  hasMore,
  isLoading = false,
  rootMargin = "0px",
  threshold = 0,
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<T | null>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry?.isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [onLoadMore, hasMore, isLoading]
  );

  useEffect(() => {
    // Disconnect any previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (!sentinelRef.current) return;

    observerRef.current = new IntersectionObserver(handleIntersection, {
      rootMargin,
      threshold,
    });

    observerRef.current.observe(sentinelRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [handleIntersection, rootMargin, threshold]);

  return sentinelRef;
}
