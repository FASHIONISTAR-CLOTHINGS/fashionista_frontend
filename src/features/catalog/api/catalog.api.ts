/**
 * features/catalog/api/catalog.api.ts — Client-side Ky API (runs in browser)
 *
 * Uses apiAsync (Ky) for all client-side catalog calls.
 * Server-side calls use catalog.server.ts (native fetch + ISR).
 */
import { apiAsync } from "@/core/api/client.async";
import { unwrapResults } from "@/core/api/response";
import {
  CatalogBrandListSchema,
  CatalogBlogPostListSchema,
  CatalogCategoryListSchema,
  CatalogCollectionListSchema,
} from "../schemas/catalog.schemas";
import type {
  CatalogBlogPost,
  CatalogBrand,
  CatalogCategory,
  CatalogCollection,
  CatalogSearchResult,
  CatalogTag,
  PaginatedProducts,
} from "../types/catalog.types";

function safeUnwrap<T>(data: unknown): T[] {
  const d = (data as Record<string, unknown>)?.data ?? data;
  if (d && typeof d === "object" && "results" in (d as object)) {
    const arr = (d as { results: unknown }).results;
    return Array.isArray(arr) ? (arr as T[]) : [];
  }
  return Array.isArray(d) ? (d as T[]) : [];
}

function safeUnwrapObject<T>(data: unknown): T | null {
  const d = (data as Record<string, unknown>)?.data ?? data;
  return (d as T) ?? null;
}

export const catalogApi = {
  // ── Existing list endpoints ──────────────────────────────────────────────

  async getCategories(): Promise<CatalogCategory[]> {
    const data = await apiAsync.get("catalog/categories/").json();
    return CatalogCategoryListSchema.parse(unwrapResults<CatalogCategory>(data));
  },

  async getBrands(): Promise<CatalogBrand[]> {
    const data = await apiAsync.get("catalog/brands/").json();
    return CatalogBrandListSchema.parse(unwrapResults<CatalogBrand>(data));
  },

  async getCollections(): Promise<CatalogCollection[]> {
    const data = await apiAsync.get("catalog/collections/").json();
    return CatalogCollectionListSchema.parse(unwrapResults<CatalogCollection>(data));
  },

  async getBlogPosts(): Promise<CatalogBlogPost[]> {
    const data = await apiAsync.get("catalog/blog/").json();
    return CatalogBlogPostListSchema.parse(unwrapResults<CatalogBlogPost>(data));
  },

  // ── Phase C5 — Detail + paginated endpoints ───────────────────────────────

  async getCategoryDetail(slug: string): Promise<CatalogCategory | null> {
    try {
      const data = await apiAsync.get(`catalog/categories/${slug}/detail/`).json();
      return safeUnwrapObject<CatalogCategory>(data);
    } catch {
      return null;
    }
  },

  async getBrandDetail(slug: string): Promise<CatalogBrand | null> {
    try {
      const data = await apiAsync.get(`catalog/brands/${slug}/detail/`).json();
      return safeUnwrapObject<CatalogBrand>(data);
    } catch {
      return null;
    }
  },

  async getCollectionDetail(slug: string): Promise<CatalogCollection | null> {
    try {
      const data = await apiAsync.get(`catalog/collections/${slug}/detail/`).json();
      return safeUnwrapObject<CatalogCollection>(data);
    } catch {
      return null;
    }
  },

  async getCategoryProducts(
    slug: string,
    page = 1,
    page_size = 12
  ): Promise<PaginatedProducts> {
    const data = await apiAsync
      .get(`catalog/categories/${slug}/products/`, {
        searchParams: { page, page_size },
      })
      .json();
    return (safeUnwrapObject<PaginatedProducts>(data) ?? {
      results: [],
      count: 0,
      page,
      page_size,
    });
  },

  async getBrandProducts(
    slug: string,
    page = 1,
    page_size = 12
  ): Promise<PaginatedProducts> {
    const data = await apiAsync
      .get(`catalog/brands/${slug}/products/`, {
        searchParams: { page, page_size },
      })
      .json();
    return (safeUnwrapObject<PaginatedProducts>(data) ?? {
      results: [],
      count: 0,
      page,
      page_size,
    });
  },

  async getCollectionProducts(
    slug: string,
    page = 1,
    page_size = 12
  ): Promise<PaginatedProducts> {
    const data = await apiAsync
      .get(`catalog/collections/${slug}/products/`, {
        searchParams: { page, page_size },
      })
      .json();
    return (safeUnwrapObject<PaginatedProducts>(data) ?? {
      results: [],
      count: 0,
      page,
      page_size,
    });
  },

  async search(q: string): Promise<CatalogSearchResult> {
    const EMPTY: CatalogSearchResult = {
      categories: [],
      brands: [],
      collections: [],
      query: q,
    };
    if (!q.trim()) return EMPTY;
    try {
      const data = await apiAsync
        .get("catalog/search/", { searchParams: { q } })
        .json();
      return (safeUnwrapObject<CatalogSearchResult>(data) ?? EMPTY);
    } catch {
      return EMPTY;
    }
  },

  async getTags(): Promise<CatalogTag[]> {
    try {
      const data = await apiAsync.get("catalog/tags/").json();
      const d = (data as Record<string, unknown>)?.data ?? data;
      const tags = (d as { tags?: unknown }).tags;
      return Array.isArray(tags) ? (tags as CatalogTag[]) : safeUnwrap<CatalogTag>(data);
    } catch {
      return [];
    }
  },
};
