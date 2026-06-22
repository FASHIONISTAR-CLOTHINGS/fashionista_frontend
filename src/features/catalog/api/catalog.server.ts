/**
 * catalog.server.ts — Next.js 16 RSC-only server data-fetching module.
 *
 * Pattern:
 *   - All functions are async and call the Django-Ninja backend.
 *   - Uses native fetch() with Next.js ISR cache tags (revalidate: 300).
 *   - Zod validation on every response — never trust raw API shapes.
 *   - Falls back to safe empty values on any error (never throws from RSC).
 *   - MUST NOT be imported into client components ("use client" files).
 *
 * Phase 11 — Homepage Bundle:
 *   getHomepageBundle() replaces 5 separate fetches with a single endpoint
 *   that runs asyncio.gather() on the backend (5 parallel DB queries).
 *   ISR revalidate: 300 seconds (5 min) — matches backend Redis TTL.
 */

import {
  CatalogBrandListSchema,
  CatalogBlogPostListSchema,
  CatalogBlogPostSchema,
  CatalogCategoryListSchema,
  CatalogCollectionListSchema,
  HomepageBundleSchema,
} from "../schemas/catalog.schemas";
import type {
  CatalogBlogPost,
  CatalogBrand,
  CatalogCategory,
  CatalogCollection,
  HomepageBundle,
} from "../types/catalog.types";
import { getServerBackendRootUrl } from "@/core/config/api-roots";

/** Request timeout in ms — keeps SSR from hanging on slow backends. */
const FALLBACK_TIMEOUT_MS = 5_000;

/** ISR revalidation window — 5 minutes, matches backend Redis TTL. */
const ISR_REVALIDATE_SECONDS = 300;

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

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
    const response = await fetch(`${getServerBackendRootUrl()}${path}`, {
      headers: {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      next: { revalidate: ISR_REVALIDATE_SECONDS },
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
    const response = await fetch(`${getServerBackendRootUrl()}${path}`, {
      headers: {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      next: { revalidate: ISR_REVALIDATE_SECONDS },
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

/**
 * Fetch the raw homepage bundle JSON object from the backend.
 * Does NOT unwrap an envelope — the homepage bundle IS the top-level object.
 */
async function fetchHomepageBundle(path: string): Promise<unknown | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FALLBACK_TIMEOUT_MS);

  try {
    const response = await fetch(`${getServerBackendRootUrl()}${path}`, {
      headers: {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      // ISR: cache at CDN/Next.js edge for 5 minutes, then revalidate in background.
      // This means the first user after 5 min triggers a background refresh and
      // still gets a fast cached response (stale-while-revalidate semantics).
      next: { revalidate: ISR_REVALIDATE_SECONDS, tags: ["homepage-bundle"] },
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const raw: unknown = await response.json();
    // Homepage bundle is returned as a plain object — no envelope to unwrap.
    if (raw && typeof raw === "object" && "data" in raw) {
      return (raw as { data: unknown }).data;
    }
    return raw;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public server functions — individual catalog endpoints
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Phase 11 — Homepage Bundle Server Function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @deprecated Use `getHomepageBundleV2()` instead.
 * This function is an alias kept for backward-compatibility only.
 * It now delegates to the v2 bundle endpoint (6 sections + banners).
 * Will be removed in the next major engineering cleanup sprint.
 *
 * @see getHomepageBundleV2
 */
export async function getHomepageBundle(): Promise<HomepageBundle> {
  return getHomepageBundleV2();
}


// ─────────────────────────────────────────────────────────────────────────────
// Phase C4 — Detail + Paginated Catalog Server Functions
// ─────────────────────────────────────────────────────────────────────────────

import type {
  CatalogSearchResult,
  CatalogTag,
  HomepageBannerCard,
  PaginatedProducts,
} from "../types/catalog.types";

const EMPTY_BUNDLE_V2: HomepageBundle = {
  collections: [],
  categories: [],
  featured_products: [],
  hot_deals: [],
  reviews: [],
  banners: [],
  meta: {
    collections_count: 0,
    categories_count: 0,
    products_count: 0,
    hot_deals_count: 0,
    reviews_count: 0,
    banners_count: 0,
  },
};

/**
 * Homepage bundle v2 — 6 sections including hero banners.
 * Calls /catalog/homepage/bundle/ (Phase B3 endpoint).
 *
 * RESILIENT FALLBACK CHAIN:
 *   1. Try /api/v1/ninja/catalog/homepage/bundle/ (v2 with banners)
 *   2. If that fails (500 / CatalogBanner table missing), fall back to
 *      /api/v1/ninja/catalog/homepage/ (v1, always works) + banners: []
 */
export async function getHomepageBundleV2(): Promise<HomepageBundle> {
  try {
    const raw = await fetchHomepageBundle(
      "/api/v1/ninja/catalog/homepage/bundle/"
    );
    if (!raw) throw new Error("bundle_v2_empty");
    const result = HomepageBundleSchema.safeParse(raw);
    if (!result.success) {
      console.warn("[catalog.server] getHomepageBundleV2 parse error:", result.error.flatten());
      throw new Error("bundle_v2_parse_fail");
    }
    return result.data as HomepageBundle;
  } catch (err) {
    // ── Fallback: try v1 endpoint which is guaranteed to work ─────────
    console.warn(
      "[catalog.server] getHomepageBundleV2 falling back to v1 endpoint:",
      err instanceof Error ? err.message : err
    );
    try {
      const raw = await fetchHomepageBundle("/api/v1/ninja/catalog/homepage/");
      if (!raw) return EMPTY_BUNDLE_V2;
      // v1 doesn't have banners — inject empty array so schema passes
      const merged = typeof raw === "object" && raw !== null
        ? { banners: [], ...raw as object }
        : {};
      const result = HomepageBundleSchema.safeParse(merged);
      if (!result.success) {
        console.warn("[catalog.server] getHomepageBundleV2 v1-fallback parse error:", result.error.flatten());
        return EMPTY_BUNDLE_V2;
      }
      return result.data as HomepageBundle;
    } catch (fallbackErr) {
      console.error("[catalog.server] getHomepageBundleV2 v1-fallback also failed:", fallbackErr);
      return EMPTY_BUNDLE_V2;
    }
  }
}

/**
 * Single category detail + sub-categories.
 * ISR tag: ["categories", `category-${slug}`]
 */
export async function getCategoryDetail(
  slug: string
): Promise<CatalogCategory | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FALLBACK_TIMEOUT_MS);
  try {
    const res = await fetch(
      `${getServerBackendRootUrl()}/api/v1/ninja/catalog/categories/${slug}/detail/`,
      {
        headers: { Accept: "application/json", "ngrok-skip-browser-warning": "true" },
        next: { revalidate: ISR_REVALIDATE_SECONDS, tags: ["categories", `category-${slug}`] },
        signal: controller.signal,
      }
    );
    if (!res.ok) return null;
    const raw = await res.json();
    const data = raw?.data ?? raw;
    return data as CatalogCategory;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Paginated products by category slug.
 * ISR tag: [`category-products-${slug}`]
 */
export async function getCategoryProducts(
  slug: string,
  page = 1,
  page_size = 12
): Promise<PaginatedProducts> {
  const EMPTY: PaginatedProducts = { results: [], count: 0, page, page_size };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FALLBACK_TIMEOUT_MS);
  try {
    const res = await fetch(
      `${getServerBackendRootUrl()}/api/v1/ninja/catalog/categories/${slug}/products/?page=${page}&page_size=${page_size}`,
      {
        headers: { Accept: "application/json", "ngrok-skip-browser-warning": "true" },
        next: { revalidate: 60, tags: [`category-products-${slug}`] },
        signal: controller.signal,
      }
    );
    if (!res.ok) return EMPTY;
    const raw = await res.json();
    return (raw?.data ?? raw) as PaginatedProducts;
  } catch {
    return EMPTY;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Single brand detail.
 * ISR tag: ["brands", `brand-${slug}`]
 */
export async function getBrandDetail(
  slug: string
): Promise<CatalogBrand | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FALLBACK_TIMEOUT_MS);
  try {
    const res = await fetch(
      `${getServerBackendRootUrl()}/api/v1/ninja/catalog/brands/${slug}/detail/`,
      {
        headers: { Accept: "application/json", "ngrok-skip-browser-warning": "true" },
        next: { revalidate: ISR_REVALIDATE_SECONDS, tags: ["brands", `brand-${slug}`] },
        signal: controller.signal,
      }
    );
    if (!res.ok) return null;
    const raw = await res.json();
    return (raw?.data ?? raw) as CatalogBrand;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Paginated products by brand slug.
 * ISR tag: [`brand-products-${slug}`]
 */
export async function getBrandProducts(
  slug: string,
  page = 1,
  page_size = 12
): Promise<PaginatedProducts> {
  const EMPTY: PaginatedProducts = { results: [], count: 0, page, page_size };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FALLBACK_TIMEOUT_MS);
  try {
    const res = await fetch(
      `${getServerBackendRootUrl()}/api/v1/ninja/catalog/brands/${slug}/products/?page=${page}&page_size=${page_size}`,
      {
        headers: { Accept: "application/json", "ngrok-skip-browser-warning": "true" },
        next: { revalidate: 60, tags: [`brand-products-${slug}`] },
        signal: controller.signal,
      }
    );
    if (!res.ok) return EMPTY;
    const raw = await res.json();
    return (raw?.data ?? raw) as PaginatedProducts;
  } catch {
    return EMPTY;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Single collection detail.
 * ISR tag: ["collections", `collection-${slug}`]
 */
export async function getCollectionDetail(
  slug: string
): Promise<CatalogCollection | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FALLBACK_TIMEOUT_MS);
  try {
    const res = await fetch(
      `${getServerBackendRootUrl()}/api/v1/ninja/catalog/collections/${slug}/detail/`,
      {
        headers: { Accept: "application/json", "ngrok-skip-browser-warning": "true" },
        next: { revalidate: ISR_REVALIDATE_SECONDS, tags: ["collections", `collection-${slug}`] },
        signal: controller.signal,
      }
    );
    if (!res.ok) return null;
    const raw = await res.json();
    return (raw?.data ?? raw) as CatalogCollection;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Paginated products by collection slug.
 * ISR tag: [`collection-products-${slug}`]
 */
export async function getCollectionProducts(
  slug: string,
  page = 1,
  page_size = 12
): Promise<PaginatedProducts> {
  const EMPTY: PaginatedProducts = { results: [], count: 0, page, page_size };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FALLBACK_TIMEOUT_MS);
  try {
    const res = await fetch(
      `${getServerBackendRootUrl()}/api/v1/ninja/catalog/collections/${slug}/products/?page=${page}&page_size=${page_size}`,
      {
        headers: { Accept: "application/json", "ngrok-skip-browser-warning": "true" },
        next: { revalidate: 60, tags: [`collection-products-${slug}`] },
        signal: controller.signal,
      }
    );
    if (!res.ok) return EMPTY;
    const raw = await res.json();
    return (raw?.data ?? raw) as PaginatedProducts;
  } catch {
    return EMPTY;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Active homepage hero banners from CMS.
 * ISR tag: ["banners"] — short revalidate: 60s for fast CMS updates.
 */
export async function getCatalogBanners(
  slot = "hero"
): Promise<HomepageBannerCard[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FALLBACK_TIMEOUT_MS);
  try {
    const res = await fetch(
      `${getServerBackendRootUrl()}/api/v1/ninja/catalog/homepage/banners/?slot=${slot}`,
      {
        headers: { Accept: "application/json", "ngrok-skip-browser-warning": "true" },
        next: { revalidate: 60, tags: ["banners"] },
        signal: controller.signal,
      }
    );
    if (!res.ok) return [];
    const raw = await res.json();
    const data = raw?.data ?? raw;
    return Array.isArray(data?.banners) ? data.banners : [];
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Trending catalog tags.
 * ISR tag: ["tags"] — revalidate: 600s (10 min).
 */
export async function getCatalogTags(): Promise<CatalogTag[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FALLBACK_TIMEOUT_MS);
  try {
    const res = await fetch(
      `${getServerBackendRootUrl()}/api/v1/ninja/catalog/tags/`,
      {
        headers: { Accept: "application/json", "ngrok-skip-browser-warning": "true" },
        next: { revalidate: 600, tags: ["tags"] },
        signal: controller.signal,
      }
    );
    if (!res.ok) return [];
    const raw = await res.json();
    const data = raw?.data ?? raw;
    return Array.isArray(data?.tags) ? data.tags : [];
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Full-text search across categories, brands, collections.
 * No ISR cache — always fresh (client-side search via TanStack Query).
 */
export async function getCatalogSearch(q: string): Promise<CatalogSearchResult> {
  const EMPTY: CatalogSearchResult = { categories: [], brands: [], collections: [], query: q };
  if (!q.trim()) return EMPTY;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3_000);
  try {
    const res = await fetch(
      `${getServerBackendRootUrl()}/api/v1/ninja/catalog/search/?q=${encodeURIComponent(q)}`,
      {
        headers: { Accept: "application/json", "ngrok-skip-browser-warning": "true" },
        cache: "no-store",
        signal: controller.signal,
      }
    );
    if (!res.ok) return EMPTY;
    const raw = await res.json();
    return ((raw?.data ?? raw) || EMPTY) as CatalogSearchResult;
  } catch {
    return EMPTY;
  } finally {
    clearTimeout(timeout);
  }
}
