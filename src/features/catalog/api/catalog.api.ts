/**
 * features/catalog/api/catalog.api.ts — Client-side Ky API (runs in browser)
 *
 * Uses apiAsync (Ky) for all client-side catalog calls.
 * Server-side calls use catalog.server.ts (native fetch + ISR).
 *
 * U5: Merged from product-catalog.api.ts — listProducts, searchSuggest,
 *     getProduct, getProductBundle, logProductView are now canonical here.
 *     product-catalog.api.ts is DELETED; callers use catalogApi directly.
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
  CatalogVendorCard,
  CatalogSearchResult,
  CatalogTag,
  PaginatedProducts,
  PaginatedVendors,
} from "../types/catalog.types";

// ─── Shared param types (formerly in product-catalog.api.ts) ─────────────────

export interface ProductCatalogParams {
  page?: number;
  page_size?: number;
  q?: string;
  category?: string;
  collection?: string;
  brand?: string;
  vendor?: string;
  in_stock?: boolean;
  featured?: boolean;
  min_price?: string;
  max_price?: string;
  ordering?: string;
  gender_target?: string;
  condition?: string;
}

export interface PaginatedProductsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CatalogProductCard[];
}

export interface CatalogProductCard {
  id: string;
  title: string;
  slug: string;
  sku: string;
  price: string;
  old_price: string | null;
  discount_percentage: number;
  currency: string;
  image_url: string | null;
  cloudinary_url?: string | null;
  in_stock: boolean;
  stock_qty: number;
  featured: boolean;
  hot_deal: boolean;
  rating: number;
  review_count: number;
  computed_review_count: number;
  computed_avg_rating: number;
  category_name: string | null;
  category_slug: string | null;
  brand_name: string | null;
  brand_slug: string | null;
  vendor_name: string;
  vendor_slug: string | null;
  vendor_is_verified?: boolean;
  requires_measurement: boolean;
  is_customisable: boolean;
  is_pre_order?: boolean;
  ai_trend_score?: number;
  sustainability_score?: number;
  sizes: { id: string; name: string }[];
  colors: { id: string; name: string; hex_code: string }[];
  created_at: string;
}

export interface SearchSuggestResponse {
  results: { slug: string; title: string }[];
}

export interface ViewLogPayload {
  session_key?: string;
  referrer_url?: string;
  device_type?: "desktop" | "mobile" | "tablet" | "unknown";
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

// ─── Query builder ────────────────────────────────────────────────────────────

function buildProductParams(
  params: ProductCatalogParams,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (params.page) out.page = String(params.page);
  if (params.page_size) out.page_size = String(params.page_size);
  if (params.q) out.q = params.q;
  if (params.category) out.category = params.category;
  if (params.collection) out.collection = params.collection;
  if (params.brand) out.brand = params.brand;
  if (params.vendor) out.vendor = params.vendor;
  if (params.in_stock !== undefined) out.in_stock = String(params.in_stock);
  if (params.featured !== undefined) out.featured = String(params.featured);
  if (params.min_price) out.min_price = params.min_price;
  if (params.max_price) out.max_price = params.max_price;
  if (params.ordering) out.ordering = params.ordering;
  if (params.gender_target) out.gender_target = params.gender_target;
  if (params.condition) out.condition = params.condition;
  return out;
}

// ─── Canonical client API ─────────────────────────────────────────────────────

export const catalogApi = {
  // ── Catalog entity list endpoints ─────────────────────────────────────────

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
    return CatalogCollectionListSchema.parse(
      unwrapResults<CatalogCollection>(data),
    );
  },

  // ── Detail + paginated endpoints ──────────────────────────────────────────

  async getCategoryDetail(slug: string): Promise<CatalogCategory | null> {
    try {
      const data = await apiAsync
        .get(`catalog/categories/${slug}/detail/`)
        .json();
      return unwrapResults<CatalogCategory>(data)[0] ?? null;
    } catch {
      return null;
    }
  },

  async getBrandDetail(slug: string): Promise<CatalogBrand | null> {
    try {
      const data = await apiAsync.get(`catalog/brands/${slug}/detail/`).json();
      return unwrapResults<CatalogBrand>(data)[0] ?? null;
    } catch {
      return null;
    }
  },

  async getCollectionDetail(slug: string): Promise<CatalogCollection | null> {
    try {
      const data = await apiAsync
        .get(`catalog/collections/${slug}/detail/`)
        .json();
      return unwrapResults<CatalogCollection>(data)[0] ?? null;
    } catch {
      return null;
    }
  },

  async getCategoryProducts(
    slug: string,
    page = 1,
    page_size = 12,
  ): Promise<PaginatedProducts> {
    const data = await apiAsync
      .get(`catalog/categories/${slug}/products/`, {
        searchParams: { page, page_size },
      })
      .json();
    const results = unwrapResults<PaginatedProducts>(data);
    return results[0] ?? { results: [], count: 0, page, page_size };
  },

  async getBrandProducts(
    slug: string,
    page = 1,
    page_size = 12,
  ): Promise<PaginatedProducts> {
    const data = await apiAsync
      .get(`catalog/brands/${slug}/products/`, {
        searchParams: { page, page_size },
      })
      .json();
    const results = unwrapResults<PaginatedProducts>(data);
    return results[0] ?? { results: [], count: 0, page, page_size };
  },

  async getCollectionProducts(
    slug: string,
    page = 1,
    page_size = 12,
  ): Promise<PaginatedProducts> {
    const data = await apiAsync
      .get(`catalog/collections/${slug}/products/`, {
        searchParams: { page, page_size },
      })
      .json();
    const results = unwrapResults<PaginatedProducts>(data);
    return results[0] ?? { results: [], count: 0, page, page_size };
  },

  async getCollectionVendors(
    slug: string,
    page = 1,
    page_size = 12,
  ): Promise<PaginatedVendors> {
    const data = await apiAsync
      .get(`catalog/collections/${slug}/vendors/`, {
        searchParams: { page, page_size },
      })
      .json();
    const results = unwrapResults<PaginatedVendors>(data);
    return (
      results[0] ?? {
        results: [] as CatalogVendorCard[],
        count: 0,
        page,
        page_size,
      }
    );
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
      return unwrapResults<CatalogSearchResult>(data)[0] ?? EMPTY;
    } catch {
      return EMPTY;
    }
  },

  async getTags(): Promise<CatalogTag[]> {
    try {
      const data = await apiAsync.get("catalog/tags/").json();
      const d = (data as Record<string, unknown>)?.data ?? data;
      const tags = (d as { tags?: unknown }).tags;
      return Array.isArray(tags)
        ? (tags as CatalogTag[])
        : unwrapResults<CatalogTag>(data);
    } catch {
      return [];
    }
  },

  // ── U5: Product endpoints (merged from product-catalog.api.ts) ────────────

  /**
   * GET /api/ninja/products/?{filters}
   * Full-text search + multi-filter paginated product list.
   */
  async listProducts(
    params: ProductCatalogParams = {},
  ): Promise<PaginatedProductsResponse> {
    const searchParams = buildProductParams(params);
    return apiAsync
      .get("products/", { searchParams })
      .json<PaginatedProductsResponse>();
  },

  /**
   * GET /api/ninja/products/search/suggest/?q={q}
   * Lightweight autocomplete — returns [{slug, title}] only.
   */
  async searchSuggest(q: string): Promise<{ slug: string; title: string }[]> {
    const data = await apiAsync
      .get("products/search/suggest/", { searchParams: { q } })
      .json<SearchSuggestResponse>();
    return data.results ?? [];
  },

  /**
   * GET /api/ninja/products/{slug}/
   * Full product detail for the PDP.
   */
  async getProduct(slug: string) {
    return apiAsync.get(`products/${slug}/`).json();
  },

  /**
   * GET /api/ninja/products/{slug}/bundle/
   * Parallel bundle: product + reviews + wishlist in one call.
   */
  async getProductBundle(slug: string) {
    return apiAsync.get(`products/${slug}/bundle/`).json();
  },

  /**
   * POST /api/ninja/products/{slug}/view-log/
   * Async analytics event — fire-and-forget, never await in UI code.
   */
  async logProductView(
    slug: string,
    payload: ViewLogPayload = {},
  ): Promise<void> {
    try {
      await apiAsync.post(`products/${slug}/view-log/`, { json: payload });
    } catch {
      // Analytics failures must NEVER break the user experience
    }
  },

  /**
   * GET /api/ninja/vendors/?{filters}
   * Paginated vendor list. C15/plan: added getVendors to catalogApi.
   */
  async getVendors(
    page = 1,
    filters: Record<string, string> = {},
  ): Promise<PaginatedVendors> {
    try {
      const data = await apiAsync
        .get("vendors/", { searchParams: { page: String(page), ...filters } })
        .json();
      const results = unwrapResults<PaginatedVendors>(data);
      return results[0] ?? { results: [] as CatalogVendorCard[], count: 0 };
    } catch {
      return { results: [] as CatalogVendorCard[], count: 0 };
    }
  },

  /**
   * GET /api/ninja/blog/?limit={limit}
   * Latest blog posts for the Style Guide rail (R19).
   * Returns empty array on error — rail renders null if no posts.
   */
  async getBlogPosts(limit = 3): Promise<CatalogBlogPost[]> {
    try {
      const data = await apiAsync
        .get("blog/", { searchParams: { limit: String(limit) } })
        .json();
      const parsed = CatalogBlogPostListSchema.safeParse(
        (data as { results?: unknown })?.results ?? data
      );
      return parsed.success ? parsed.data : [];
    } catch {
      return [];
    }
  },
};

/**
 * U5 COMPATIBILITY SHIM — productCatalogApi
 *
 * This re-exports catalogApi under the old name so existing callers
 * (use-catalog-products.ts, catalog/index.ts) keep working without
 * a hard breaking change. Both references now point to the same object.
 *
 * Migration: Update callers to import { catalogApi } and remove this shim
 * in the next sprint once all direct references are updated.
 */
export const productCatalogApi = catalogApi;
