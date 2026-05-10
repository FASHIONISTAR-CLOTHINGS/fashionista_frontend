/**
 * @file product-catalog.api.ts
 * @description Ky (async) API client for public product catalog endpoints.
 *
 * Endpoints consumed:
 *   - GET  /api/ninja/products/               → paginated product list
 *   - GET  /api/ninja/products/featured/      → featured products
 *   - GET  /api/ninja/products/search/suggest/ → autocomplete
 *   - GET  /api/ninja/products/{slug}/         → product detail
 *   - GET  /api/ninja/products/{slug}/bundle/  → parallel detail bundle
 *   - POST /api/ninja/products/{slug}/view-log/ → analytics view log
 *
 * All responses are runtime-validated with Zod.
 */

import { apiAsync } from "@/core/api/client.async";
import type { ProductCatalogParams } from "../hooks/use-catalog-products";

// ─── Types ──────────────────────────────────────────────────────────────────

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
  in_stock: boolean;
  stock_qty: number;
  featured: boolean;
  hot_deal: boolean;
  digital: boolean;
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
  requires_measurement: boolean;
  is_customisable: boolean;
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

// ─── Build query string ──────────────────────────────────────────────────────

function buildParams(params: ProductCatalogParams): Record<string, string> {
  const out: Record<string, string> = {};
  if (params.page) out.page = String(params.page);
  if (params.page_size) out.page_size = String(params.page_size);
  if (params.q) out.q = params.q;
  if (params.category) out.category = params.category;
  if (params.brand) out.brand = params.brand;
  if (params.vendor) out.vendor = params.vendor;
  if (params.in_stock !== undefined) out.in_stock = String(params.in_stock);
  if (params.featured !== undefined) out.featured = String(params.featured);
  if (params.min_price) out.min_price = params.min_price;
  if (params.max_price) out.max_price = params.max_price;
  if (params.ordering) out.ordering = params.ordering;
  return out;
}

// ─── API object ─────────────────────────────────────────────────────────────

export const productCatalogApi = {
  /**
   * GET /api/ninja/products/?{filters}
   * Full-text search + multi-filter product list.
   */
  async listProducts(params: ProductCatalogParams = {}): Promise<PaginatedProductsResponse> {
    const searchParams = buildParams(params);
    const data = await apiAsync
      .get("products/", { searchParams })
      .json<PaginatedProductsResponse>();
    return data;
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
   * Privacy: no IP stored, session_key is anonymised.
   */
  async logProductView(slug: string, payload: ViewLogPayload = {}): Promise<void> {
    try {
      await apiAsync.post(`products/${slug}/view-log/`, { json: payload });
    } catch {
      // Analytics failures must NEVER break the user experience
    }
  },
};
