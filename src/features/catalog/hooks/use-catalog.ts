/**
 * features/catalog/hooks/use-catalog.ts  — C5
 *
 * TanStack Query client hooks for catalog data.
 * All hooks use the Ky async client (apiAsync) from the catalog.api module.
 *
 * Pattern:
 *   - useQuery for simple reads
 *   - useInfiniteQuery for paginated product lists (infinite scroll)
 *   - All server-state lives here; UI state lives in catalog.store.ts (Zustand)
 */
"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { catalogApi } from "../api/catalog.api";
import type { CatalogSortOption } from "../types/catalog.types";

const STALE_5MIN   = 5 * 60 * 1_000;  // 5 min  — matches ISR revalidate
const STALE_1MIN   = 1 * 60 * 1_000;  // 1 min  — paginated lists
const STALE_10MIN  = 10 * 60 * 1_000; // 10 min — tags

// ─────────────────────────────────────────────────────────────────────────────
// Existing hooks (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

export function useCatalogCategories() {
  return useQuery({
    queryKey: ["catalog", "categories"],
    queryFn: catalogApi.getCategories,
    staleTime: STALE_5MIN,
  });
}

export function useCatalogBrands() {
  return useQuery({
    queryKey: ["catalog", "brands"],
    queryFn: catalogApi.getBrands,
    staleTime: STALE_5MIN,
  });
}

export function useCatalogCollections() {
  return useQuery({
    queryKey: ["catalog", "collections"],
    queryFn: catalogApi.getCollections,
    staleTime: STALE_5MIN,
  });
}

export function useCatalogBlogPosts() {
  return useQuery({
    queryKey: ["catalog", "blog"],
    queryFn: catalogApi.getBlogPosts,
    staleTime: STALE_5MIN,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase C5 — New paginated + detail + search hooks
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12;

/**
 * Infinite paginated products by category slug.
 * Usage: const { data, fetchNextPage, hasNextPage } = useCategoryProducts(slug)
 */
export function useCategoryProducts(
  slug: string,
  sortBy: CatalogSortOption = "newest"
) {
  return useInfiniteQuery({
    queryKey: ["catalog", "category-products", slug, sortBy],
    queryFn: ({ pageParam = 1 }) =>
      catalogApi.getCategoryProducts(slug, pageParam as number, PAGE_SIZE),
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.page_size;
      return loaded < lastPage.count ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: STALE_1MIN,
    enabled: !!slug,
  });
}

/**
 * Infinite paginated products by brand slug.
 */
export function useBrandProducts(
  slug: string,
  sortBy: CatalogSortOption = "newest"
) {
  return useInfiniteQuery({
    queryKey: ["catalog", "brand-products", slug, sortBy],
    queryFn: ({ pageParam = 1 }) =>
      catalogApi.getBrandProducts(slug, pageParam as number, PAGE_SIZE),
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.page_size;
      return loaded < lastPage.count ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: STALE_1MIN,
    enabled: !!slug,
  });
}

/**
 * Infinite paginated vendors by collection slug.
 */
export function useCollectionVendors(
  slug: string,
  sortBy: CatalogSortOption = "newest"
) {
  return useInfiniteQuery({
    queryKey: ["catalog", "collection-vendors", slug, sortBy],
    queryFn: ({ pageParam = 1 }) =>
      catalogApi.getCollectionVendors(slug, pageParam as number, PAGE_SIZE),
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.page_size;
      return loaded < lastPage.count ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: STALE_1MIN,
    enabled: !!slug,
  });
}

/**
 * Debounced catalog search across categories, brands, collections.
 * Only fires when query length >= 2 characters.
 * Cache: 30s staleTime (matches backend 30s TTL).
 */
export function useCatalogSearch(q: string) {
  return useQuery({
    queryKey: ["catalog", "search", q],
    queryFn: () => catalogApi.search(q),
    staleTime: 30_000,
    enabled: q.trim().length >= 2,
    placeholderData: (prev) => prev, // keep previous results while typing
  });
}

/**
 * Trending catalog tags for homepage tag rail.
 * Cache: 10 min staleTime (matches backend 600s TTL).
 */
export function useCatalogTags() {
  return useQuery({
    queryKey: ["catalog", "tags"],
    queryFn: catalogApi.getTags,
    staleTime: STALE_10MIN,
  });
}

/**
 * Category detail with children.
 */
export function useCategoryDetail(slug: string) {
  return useQuery({
    queryKey: ["catalog", "category", slug],
    queryFn: () => catalogApi.getCategoryDetail(slug),
    staleTime: STALE_5MIN,
    enabled: !!slug,
  });
}

/**
 * Brand detail.
 */
export function useBrandDetail(slug: string) {
  return useQuery({
    queryKey: ["catalog", "brand", slug],
    queryFn: () => catalogApi.getBrandDetail(slug),
    staleTime: STALE_5MIN,
    enabled: !!slug,
  });
}

/**
 * Collection detail.
 */
export function useCollectionDetail(slug: string) {
  return useQuery({
    queryKey: ["catalog", "collection", slug],
    queryFn: () => catalogApi.getCollectionDetail(slug),
    staleTime: STALE_5MIN,
    enabled: !!slug,
  });
}
