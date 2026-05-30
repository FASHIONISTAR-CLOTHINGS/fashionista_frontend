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
 * Fetch the entire homepage data bundle in a single HTTP round-trip.
 *
 * Backend behavior:
 *   - Django-Ninja GET /api/v1/ninja/catalog/homepage/
 *   - Runs 5 DB queries in parallel via asyncio.gather()
 *   - Result cached in Redis for 5 minutes (catalog:homepage:bundle key)
 *   - Total backend latency: <30ms p95 (single DB RTT, parallel reads)
 *
 * Frontend behavior:
 *   - Next.js ISR: revalidate: 300 seconds with tag "homepage-bundle"
 *   - On cache HIT: returns in <1ms (edge CDN or Node cache)
 *   - On cache MISS: SSR fetch → Zod parse → render (first user, or after 5 min)
 *   - Falls back to empty safe bundle on any error — homepage never throws
 *
 * Returns a typed HomepageBundle with:
 *   - collections      — up to 10 collection carousel cards
 *   - categories       — up to 10 category grid cards
 *   - featured_products — up to 10 featured product cards
 *   - hot_deals        — up to 10 hot-deal product cards
 *   - reviews          — up to 8 public review cards
 *   - meta             — count metadata for each section
 */
export async function getHomepageBundle(): Promise<HomepageBundle> {
  const EMPTY_BUNDLE: HomepageBundle = {
    collections: [],
    categories: [],
    featured_products: [],
    hot_deals: [],
    reviews: [],
    meta: {
      collections_count: 0,
      categories_count: 0,
      products_count: 0,
      hot_deals_count: 0,
      reviews_count: 0,
    },
  };

  try {
    const raw = await fetchHomepageBundle("/api/v1/ninja/catalog/homepage/");
    if (!raw) return EMPTY_BUNDLE;

    const result = HomepageBundleSchema.safeParse(raw);
    if (!result.success) {
      console.warn(
        "[catalog.server] getHomepageBundle parse error:",
        result.error.flatten(),
      );
      // Return what we can — partial data is better than nothing
      return EMPTY_BUNDLE;
    }
    return result.data as HomepageBundle;
  } catch (err) {
    console.error("[catalog.server] getHomepageBundle unexpected error:", err);
    return EMPTY_BUNDLE;
  }
}
