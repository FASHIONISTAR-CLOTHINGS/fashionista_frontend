"use client";

/**
 * @file use-catalog-products.ts
 * @description TanStack Query hooks for the catalog product listing.
 *
 * U5: Now imports from canonical catalogApi (catalog.api.ts).
 *     product-catalog.api.ts is deprecated — all calls go through catalogApi.
 *
 * Features:
 *   - Auto-refetches when any filter param changes (queryKey includes all params)
 *   - 60s stale time — catalog data is relatively stable
 *   - keepPreviousData = true — avoids layout flash on page/filter changes
 *   - Zod-parsed response for runtime type safety
 *
 * Used by: /app/(home)/products/page.tsx
 */

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { catalogApi } from "../api/catalog.api";

// Re-export the params type so existing callers keep working
export type { ProductCatalogParams } from "../api/catalog.api";

const PRODUCT_LIST_STALE_MS = 5 * 60 * 1000; // TP5: 5 minutes (was 60s)

export function useCatalogProducts(
  params: Parameters<typeof catalogApi.listProducts>[0] = {},
) {
  return useQuery({
    queryKey: ["catalog", "products", params],
    queryFn: () => catalogApi.listProducts(params),
    staleTime: PRODUCT_LIST_STALE_MS,
    placeholderData: (prev) => prev, // keepPreviousData in TanStack Query v5
    refetchOnWindowFocus: false,
  });
}

export function useFeaturedProducts(limit = 8) {
  return useQuery({
    queryKey: ["catalog", "products", "featured", limit],
    queryFn: () =>
      catalogApi.listProducts({ featured: true, page_size: limit }),
    staleTime: PRODUCT_LIST_STALE_MS * 2,
    refetchOnWindowFocus: false,
  });
}

export function useProductSearchSuggest(q: string, enabled = true) {
  return useQuery({
    queryKey: ["catalog", "products", "suggest", q],
    queryFn: () => catalogApi.searchSuggest(q),
    enabled: enabled && q.trim().length >= 2,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Infinite scroll variant of useCatalogProducts.
 * Uses useInfiniteQuery to fetch pages on demand as the user scrolls.
 */
export function useInfiniteCatalogProducts(
  params: Parameters<typeof catalogApi.listProducts>[0] = {},
) {
  return useInfiniteQuery({
    queryKey: ["catalog", "products", "infinite", params],
    queryFn: ({ pageParam }) =>
      catalogApi.listProducts({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.next) return undefined;
      return allPages.length + 1;
    },
    staleTime: PRODUCT_LIST_STALE_MS,
    refetchOnWindowFocus: false,
  });
}
