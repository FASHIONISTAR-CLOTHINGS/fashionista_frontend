"use client";

import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "../api/catalog.api";

const CATALOG_STALE_TIME_MS = 5 * 60 * 1000;

export function useCatalogCategories() {
  return useQuery({
    queryKey: ["catalog", "categories"],
    queryFn: catalogApi.getCategories,
    staleTime: CATALOG_STALE_TIME_MS,
  });
}

export function useCatalogBrands() {
  return useQuery({
    queryKey: ["catalog", "brands"],
    queryFn: catalogApi.getBrands,
    staleTime: CATALOG_STALE_TIME_MS,
  });
}

export function useCatalogCollections() {
  return useQuery({
    queryKey: ["catalog", "collections"],
    queryFn: catalogApi.getCollections,
    staleTime: CATALOG_STALE_TIME_MS,
  });
}

export function useCatalogBlogPosts() {
  return useQuery({
    queryKey: ["catalog", "blog"],
    queryFn: catalogApi.getBlogPosts,
    staleTime: CATALOG_STALE_TIME_MS,
  });
}
