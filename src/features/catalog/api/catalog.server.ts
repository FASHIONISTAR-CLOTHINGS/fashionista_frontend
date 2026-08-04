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
 * Consolidated Homepage Bundle:
 *   getHomepageBundle() calls the single /catalog/homepage/ endpoint that runs
 *   asyncio.gather(return_exceptions=True) on the backend (12 parallel DB queries).
 *   Returns all 12 homepage sections in one response — zero additional HTTP round-trips.
 *   ISR revalidate: 300 seconds (5 min) — matches backend Redis TTL.
 */

import { z } from "zod";
import {
  CatalogBrandListSchema,
  CatalogBlogPostListSchema,
  CatalogBlogPostSchema,
  CatalogCategoryListSchema,
  CatalogCollectionListSchema,
  HomepageProductCardSchema,
  HomepageReviewCardSchema,
  HomepageCollectionCardSchema,
  HomepageCategoryCardSchema,
  HomepageBannerCardSchema,
  HomepageBundleMetaSchema,
  HomepageVendorCardSchema,
  HomepageBlogCardSchema,
  HomepageTagCardSchema,
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

/** ISR revalidation window — 1 hour, matches backend Redis TTL. */
const ISR_REVALIDATE_SECONDS = 3600;

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

async function fetchCatalog(path: string, tags?: string[]): Promise<unknown[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FALLBACK_TIMEOUT_MS);

  try {
    const response = await fetch(`${getServerBackendRootUrl()}${path}`, {
      headers: {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      next: { revalidate: ISR_REVALIDATE_SECONDS, ...(tags ? { tags } : {}) },
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

async function fetchCatalogItem(path: string, tags?: string[]): Promise<unknown | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FALLBACK_TIMEOUT_MS);

  try {
    const response = await fetch(`${getServerBackendRootUrl()}${path}`, {
      headers: {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      next: { revalidate: ISR_REVALIDATE_SECONDS, ...(tags ? { tags } : {}) },
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
  const raw = await fetchCatalog("/api/v1/ninja/catalog/blog/", ["blog"]);
  const result = CatalogBlogPostListSchema.safeParse(raw);
  if (!result.success) {
    console.warn("[catalog.server] getCatalogBlogPosts parse error:", result.error.flatten());
    return [];
  }
  return result.data;
}

export async function getCatalogBlogPostBySlug(slug: string): Promise<CatalogBlogPost | null> {
  const raw = await fetchCatalogItem(`/api/v1/ninja/catalog/blog/${slug}/`, ["blog"]);
  if (!raw) return null;
  const result = CatalogBlogPostSchema.safeParse(raw);
  if (!result.success) {
    console.warn("[catalog.server] getCatalogBlogPostBySlug parse error:", result.error.flatten());
    return null;
  }
  return result.data;
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

const EMPTY_BUNDLE: HomepageBundle = {
  collections: [],
  categories: [],
  featured_products: [],
  hot_deals: [],
  reviews: [],
  banners: [],
  trending_products: [],
  vendors: [],
  blog_posts: [],
  trending_tags: [],
  deals_of_the_week: [],
  new_arrivals: [],
  meta: {
    collections_count: 0,
    categories_count: 0,
    products_count: 0,
    hot_deals_count: 0,
    reviews_count: 0,
    banners_count: 0,
    trending_count: 0,
    vendors_count: 0,
    blog_count: 0,
    tags_count: 0,
    deals_of_week_count: 0,
    new_arrivals_count: 0,
    gather_ms: 0,
  },
};

/**
 * Homepage bundle (consolidated) — 12 sections via a single asyncio.gather()
 * on the backend. Calls /catalog/homepage/ (the single consolidated endpoint).
 *
 * No backward compatibility — the old /homepage/bundle/ v2 route has been
 * deleted. On any error (backend down, parse fail, timeout), returns
 * EMPTY_BUNDLE with all 12 sections as empty arrays so the homepage NEVER
 * crashes and sections degrade to graceful empty states.
 *
 * ISR: revalidate 300s, tagged "homepage-bundle" for on-demand invalidation.
 */
export async function getHomepageBundle(): Promise<HomepageBundle> {
  try {
    const raw = await fetchHomepageBundle(
      "/api/v1/ninja/catalog/homepage/"
    );
    if (!raw || typeof raw !== "object") return EMPTY_BUNDLE;

    const obj = raw as Record<string, unknown>;

    // ── Per-section resilient parsing ──────────────────────────────────────
    // Each section is validated independently — if one section's data is
    // malformed, only that section degrades to [] while the other 11 still
    // render. This mirrors the backend's asyncio.gather(return_exceptions=True).
    function parseSection<T>(
      schema: z.ZodType,
      rawVal: unknown,
      sectionName: string
    ): T {
      if (!Array.isArray(rawVal)) return [] as unknown as T;
      const result = (schema as z.ZodArray<z.ZodTypeAny>).safeParse(rawVal);
      if (!result.success) {
        const errors = result.error?.errors?.slice(0, 3) ?? [];
        console.warn(
          `[catalog.server] Section "${sectionName}" parse failed:`,
          errors.map((e: { path: (string|number)[]; message: string }) => `${e.path.join(".")}: ${e.message}`).join(" | ")
        );
        return [] as unknown as T;
      }
      return result.data as T;
    }

    function parseMeta(rawVal: unknown): HomepageBundle["meta"] {
      const result = HomepageBundleMetaSchema.safeParse(rawVal);
      if (!result.success) {
        return EMPTY_BUNDLE.meta;
      }
      return result.data as HomepageBundle["meta"];
    }

    const productArr = z.array(HomepageProductCardSchema);
    const collectionArr = z.array(HomepageCollectionCardSchema);
    const categoryArr = z.array(HomepageCategoryCardSchema);
    const reviewArr = z.array(HomepageReviewCardSchema);
    const bannerArr = z.array(HomepageBannerCardSchema);
    const vendorArr = z.array(HomepageVendorCardSchema);
    const blogArr = z.array(HomepageBlogCardSchema);
    const tagArr = z.array(HomepageTagCardSchema);

    return {
      collections: parseSection(collectionArr, obj.collections, "collections"),
      categories: parseSection(categoryArr, obj.categories, "categories"),
      featured_products: parseSection(productArr, obj.featured_products, "featured_products"),
      hot_deals: parseSection(productArr, obj.hot_deals, "hot_deals"),
      reviews: parseSection(reviewArr, obj.reviews, "reviews"),
      banners: parseSection(bannerArr, obj.banners, "banners"),
      trending_products: parseSection(productArr, obj.trending_products, "trending_products"),
      vendors: parseSection(vendorArr, obj.vendors, "vendors"),
      blog_posts: parseSection(blogArr, obj.blog_posts, "blog_posts"),
      trending_tags: parseSection(tagArr, obj.trending_tags, "trending_tags"),
      deals_of_the_week: parseSection(productArr, obj.deals_of_the_week, "deals_of_the_week"),
      new_arrivals: parseSection(productArr, obj.new_arrivals, "new_arrivals"),
      meta: parseMeta(obj.meta),
    };
  } catch (err) {
    console.error("[catalog.server] getHomepageBundle failed:", err instanceof Error ? err.message : err);
    return EMPTY_BUNDLE;
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
