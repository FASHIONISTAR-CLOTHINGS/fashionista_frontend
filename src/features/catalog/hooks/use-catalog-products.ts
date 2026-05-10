"use client";

/**
 * @file use-catalog-products.ts
 * @description TanStack Query hook for the catalog product listing.
 *
 * Features:
 *   - Auto-refetches when any filter param changes (queryKey includes all params)
 *   - 60s stale time — catalog data is relatively stable
 *   - keepPreviousData = true — avoids layout flash on page/filter changes
 *   - Zod-parsed response for runtime type safety
 *
 * Used by: /app/(home)/products/page.tsx
 */

import { useQuery } from "@tanstack/react-query";
import { productCatalogApi } from "../api/product-catalog.api";

export interface ProductCatalogParams {
  page?: number;
  page_size?: number;
  q?: string;
  category?: string;
  brand?: string;
  vendor?: string;
  in_stock?: boolean;
  featured?: boolean;
  min_price?: string;
  max_price?: string;
  ordering?: string;
}

const PRODUCT_LIST_STALE_MS = 60 * 1000; // 60 seconds

export function useCatalogProducts(params: ProductCatalogParams = {}) {
  return useQuery({
    queryKey: ["catalog", "products", params],
    queryFn: () => productCatalogApi.listProducts(params),
    staleTime: PRODUCT_LIST_STALE_MS,
    placeholderData: (prev) => prev, // keepPreviousData equivalent in TanStack Query v5
    refetchOnWindowFocus: false,
  });
}

export function useFeaturedProducts(limit = 8) {
  return useQuery({
    queryKey: ["catalog", "products", "featured", limit],
    queryFn: () => productCatalogApi.listProducts({ featured: true, page_size: limit }),
    staleTime: PRODUCT_LIST_STALE_MS * 5,
    refetchOnWindowFocus: false,
  });
}

export function useProductSearchSuggest(q: string, enabled = true) {
  return useQuery({
    queryKey: ["catalog", "products", "suggest", q],
    queryFn: () => productCatalogApi.searchSuggest(q),
    enabled: enabled && q.trim().length >= 2,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });
}
