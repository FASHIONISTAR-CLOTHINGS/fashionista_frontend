"use client";

/**
 * entities/product/hooks/use-products.ts
 * TanStack Query hooks for product catalog data fetching.
 * Uses nuqs-compatible filter params for URL state sync.
 */

import { useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import type { Product, ProductListItem, ProductFilters, PaginatedProducts } from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

// ── Query Keys ──────────────────────────────────────────────────────────────
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (slug: string) => [...productKeys.details(), slug] as const,
  featured: () => [...productKeys.all, "featured"] as const,
  trending: () => [...productKeys.all, "trending"] as const,
};

// ── API Functions ────────────────────────────────────────────────────────────
async function fetchProducts(filters: ProductFilters): Promise<PaginatedProducts> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      if (Array.isArray(v)) {
        v.forEach((item) => params.append(k, String(item)));
      } else {
        params.set(k, String(v));
      }
    }
  });
  const res = await fetch(`${API_BASE}/api/v1/catalog/products/?${params}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

async function fetchProduct(slug: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/api/v1/catalog/products/${slug}/`);
  if (!res.ok) throw new Error(`Product not found: ${slug}`);
  return res.json();
}

async function fetchFeaturedProducts(): Promise<ProductListItem[]> {
  const res = await fetch(`${API_BASE}/api/v1/catalog/products/featured/`);
  if (!res.ok) throw new Error("Failed to fetch featured products");
  return res.json();
}

// ── Query Hooks ──────────────────────────────────────────────────────────────
export function useProducts(filters: ProductFilters = {}) {
  return useQuery<PaginatedProducts, Error>({
    queryKey: productKeys.list(filters),
    queryFn: () => fetchProducts(filters),
    staleTime: 2 * 60 * 1000, // 2 min — catalog is semi-static
    gcTime: 10 * 60 * 1000,
    placeholderData: (prev) => prev, // keep previous results during pagination
  });
}

export function useInfiniteProducts(filters: Omit<ProductFilters, "page"> = {}) {
  return useInfiniteQuery<PaginatedProducts, Error>({
    queryKey: [...productKeys.lists(), "infinite", filters],
    queryFn: ({ pageParam = 1 }) => fetchProducts({ ...filters, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) =>
      lastPage.next ? pages.length + 1 : undefined,
    staleTime: 2 * 60 * 1000,
  });
}

export function useProduct(slug: string) {
  return useQuery<Product, Error>({
    queryKey: productKeys.detail(slug),
    queryFn: () => fetchProduct(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFeaturedProducts() {
  return useQuery<ProductListItem[], Error>({
    queryKey: productKeys.featured(),
    queryFn: fetchFeaturedProducts,
    staleTime: 10 * 60 * 1000, // Featured products change infrequently
  });
}

/** Prefetch product detail for instant navigation */
export function usePrefetchProduct() {
  const qc = useQueryClient();
  return (slug: string) =>
    qc.prefetchQuery({
      queryKey: productKeys.detail(slug),
      queryFn: () => fetchProduct(slug),
      staleTime: 5 * 60 * 1000,
    });
}
