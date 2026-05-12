import {
  CatalogBrandListSchema,
  CatalogBlogPostListSchema,
  CatalogBlogPostSchema,
  CatalogCategoryListSchema,
  CatalogCollectionListSchema,
} from "../schemas/catalog.schemas";
import type {
  CatalogBlogPost,
  CatalogBrand,
  CatalogCategory,
  CatalogCollection,
} from "../types/catalog.types";

const FALLBACK_TIMEOUT_MS = 3_000;

function apiBaseUrl() {
  return process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";
}

function unwrapEnvelope(payload: unknown): unknown {
  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as { data: unknown }).data;
    if (data && typeof data === "object" && "results" in data) {
      return (data as { results: unknown }).results;
    }
    return data;
  }
  if (payload && typeof payload === "object" && "results" in payload) {
    return (payload as { results: unknown }).results;
  }
  return payload;
}

async function fetchCatalog(path: string): Promise<unknown[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FALLBACK_TIMEOUT_MS);

  try {
    const response = await fetch(`${apiBaseUrl()}${path}`, {
      headers: {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      next: { revalidate: 300 },
      signal: controller.signal,
    });

    if (!response.ok) return [];

    const raw = await response.json();
    const unwrapped = unwrapEnvelope(raw);
    return Array.isArray(unwrapped) ? unwrapped : [];
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchCatalogItem(path: string): Promise<unknown | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FALLBACK_TIMEOUT_MS);

  try {
    const response = await fetch(`${apiBaseUrl()}${path}`, {
      headers: {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      next: { revalidate: 300 },
      signal: controller.signal,
    });

    if (!response.ok) return null;
    return unwrapEnvelope(await response.json());
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

// ── Public server functions ─────────────────────────────────────────────────

export async function getCatalogCategories(): Promise<CatalogCategory[]> {
  const raw = await fetchCatalog("/api/v1/ninja/catalog/categories/");
  const result = CatalogCategoryListSchema.safeParse(raw);
  if (!result.success) {
    console.warn("[catalog.server] getCatalogCategories parse error:", result.error.flatten());
    return [];
  }
  return result.data;
}

export async function getCatalogBrands(): Promise<CatalogBrand[]> {
  const raw = await fetchCatalog("/api/v1/ninja/catalog/brands/");
  const result = CatalogBrandListSchema.safeParse(raw);
  if (!result.success) {
    console.warn("[catalog.server] getCatalogBrands parse error:", result.error.flatten());
    return [];
  }
  return result.data;
}

export async function getCatalogCollections(): Promise<CatalogCollection[]> {
  const raw = await fetchCatalog("/api/v1/ninja/catalog/collections/");
  const result = CatalogCollectionListSchema.safeParse(raw);
  if (!result.success) {
    console.warn("[catalog.server] getCatalogCollections parse error:", result.error.flatten());
    return [];
  }
  return result.data;
}

export async function getCatalogBlogPosts(): Promise<CatalogBlogPost[]> {
  const raw = await fetchCatalog("/api/v1/ninja/catalog/blog/");
  const result = CatalogBlogPostListSchema.safeParse(raw);
  if (!result.success) {
    console.warn("[catalog.server] getCatalogBlogPosts parse error:", result.error.flatten());
    return [];
  }
  return result.data;
}

export async function getCatalogBlogPostBySlug(slug: string): Promise<CatalogBlogPost | null> {
  const raw = await fetchCatalogItem(`/api/v1/ninja/catalog/blog/${slug}/`);
  if (!raw) return null;
  const result = CatalogBlogPostSchema.safeParse(raw);
  if (!result.success) {
    console.warn("[catalog.server] getCatalogBlogPostBySlug parse error:", result.error.flatten());
    return null;
  }
  return result.data;
}
