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
   * When true, the IntersectionObserver is disconnected entirely.
   * Use this to pause infinite scroll without unmounting the sentinel.
   * @default false
   */
  disabled?: boolean;
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
  /**
   * Debounce the `onLoadMore` call to avoid rapid-fire triggers on fast scroll.
   * Value in milliseconds. 0 disables debouncing.
   * @default 0
   */
  debounceMs?: number;
}

/**
 * Returns a ref to attach to a sentinel element at the bottom of a list.
 * When the sentinel becomes visible, `onLoadMore` is called automatically.
 *
 * Args:
 *   onLoadMore: Called when sentinel is visible and more pages are available.
 *   hasMore: Whether more pages exist.
 *   isLoading: Whether a page is currently loading (prevents double-trigger).
 *   disabled: When true, pauses observation without unmounting the sentinel.
 *   rootMargin: IntersectionObserver rootMargin (e.g. "200px" to preload early).
 *   threshold: IntersectionObserver threshold.
 *   debounceMs: Debounce window for onLoadMore to prevent rapid-fire triggers.
 *
 * Returns:
 *   A React ref to attach to the sentinel element.
 */
export function useInfiniteScroll<T extends HTMLElement = HTMLDivElement>({
  onLoadMore,
  hasMore,
  isLoading = false,
  disabled = false,
  rootMargin = "0px",
  threshold = 0,
  debounceMs = 0,
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<T | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (!entry?.isIntersecting || !hasMore || isLoading || disabled) return;

      if (debounceMs > 0) {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(onLoadMore, debounceMs);
      } else {
        onLoadMore();
      }
    },
    [onLoadMore, hasMore, isLoading, disabled, debounceMs]
  );

  useEffect(() => {
    // Disconnect any previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    // Clear any pending debounce timer on re-run
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (disabled || !sentinelRef.current) return;

    observerRef.current = new IntersectionObserver(handleIntersection, {
      rootMargin,
      threshold,
    });

    observerRef.current.observe(sentinelRef.current);

    return () => {
      observerRef.current?.disconnect();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [handleIntersection, rootMargin, threshold, disabled]);

  return sentinelRef;
}
