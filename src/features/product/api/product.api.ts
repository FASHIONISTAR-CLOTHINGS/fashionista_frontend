/**
 * @file product.api.ts
 * @description Product domain API client layer for Fashionistar frontend.
 *
 * Routing strategy:
 *  - `apiAsync` (Ky → Ninja /api/v1/ninja/products/) for all HIGH-CONCURRENCY reads:
 *    catalog feed, product detail bundles, search suggest, wishlist bulk status,
 *    coupon validation, featured/top-rated feeds.
 *  - `apiSync` (Axios → DRF /api/v1/) for all WRITE operations + vendor CRUD:
 *    create/update product, submit review, toggle wishlist, adjust inventory.
 *
 * All responses are parsed via Zod schemas before being returned.
 *
 * Base URLs:
 *   apiAsync → NEXT_PUBLIC_NINJA_API_URL  (e.g. /api/v1/ninja)
 *   apiSync  → NEXT_PUBLIC_API_V1_URL     (e.g. /api/v1)
 *
 * ────────────────────────────────────────────────────────────────────────────
 * API Endpoint Reference (backend urls.py):
 *   DRF sync:
 *     /api/v1/products/                        → vendor list/create
 *     /api/v1/products/<slug>/                  → vendor detail/update/delete
 *     /api/v1/products/<slug>/publish/          → publish submission
 *     /api/v1/products/<slug>/reviews/          → create review
 *     /api/v1/products/<slug>/wishlist/toggle/  → toggle wishlist
 *     /api/v1/products/<slug>/inventory/adjust/ → inventory adjustment (vendor)
 *     /api/v1/products/coupons/                 → vendor coupon list/create
 *     /api/v1/products/admin/<slug>/status/     → admin approve/reject
 *
 *   Ninja async:
 *     /api/v1/ninja/products/                   → public paginated feed
 *     /api/v1/ninja/products/<slug>/            → public product detail
 *     /api/v1/ninja/products/<slug>/bundle/     → product + reviews + wishlist
 *     /api/v1/ninja/products/featured/          → featured products
 *     /api/v1/ninja/products/search/suggest/    → autocomplete suggestions
 *     /api/v1/ninja/products/wishlist/          → user wishlist list
 *     /api/v1/ninja/products/wishlist/bulk/     → bulk wishlist status
 *     /api/v1/ninja/products/coupon/validate/   → coupon validation
 *     /api/v1/ninja/products/vendor/            → vendor product list
 *     /api/v1/ninja/products/vendor/<slug>/inventory/ → inventory logs
 * ────────────────────────────────────────────────────────────────────────────
 */

import { apiSync } from "@/core/api/client.sync";
import { apiAsync } from "@/core/api/client.async";
import {
  buildSearchParams,
  unwrapApiData,
  unwrapResults,
} from "@/core/api/response";
import { readAccessToken } from "@/features/auth/lib/auth-session.client";
import {
  anonymousSessionHeaders,
  anonymousSessionPayload,
  getFashionistarSessionKey,
} from "@/features/cart/lib/anonymous-session";
import {
  parseApiResponse,
  PaginatedProductListSchema,
  ProductDetailSchema,
  ProductListItemSchema,
  ProductDetailBundleSchema,
  PaginatedReviewsSchema,
  ProductReviewSchema,
  PaginatedWishlistSchema,
  WishlistToggleResultSchema,
  WishlistBulkStatusSchema,
  CouponSchema,
  CouponValidateResultSchema,
  ProductInventoryLogSchema,
  PaginatedInventoryLogsSchema,
} from "../schemas/product.schemas";
import type {
  PaginatedProductList,
  PaginatedReviews,
  PaginatedInventoryLogs,
  PaginatedWishlist,
  ProductDetail,
  ProductDetailBundle,
  ProductListItem,
  ProductReview,
  WishlistToggleResult,
  WishlistBulkStatus,
  Coupon,
  CouponValidateResult,
  ProductInventoryLog,
  CreateProductInput,
  UpdateProductInput,
  CreateReviewInput,
  VendorReplyInput,
  InventoryAdjustInput,
  CouponValidateInput,
  ProductFilterParams,
} from "../types/product.types";

function guestOptions() {
  if (readAccessToken()) return {};
  return {
    headers: anonymousSessionHeaders(),
  };
}

function guestPayload() {
  return readAccessToken() ? {} : anonymousSessionPayload();
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC CATALOG READS  (apiAsync → Ninja)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch paginated public product listing with all supported filters.
 * Endpoint: GET /api/v1/ninja/products/
 */
export async function fetchProducts(
  params?: ProductFilterParams,
): Promise<PaginatedProductList> {
  const searchParams = buildSearchParams({
    page: params?.page,
    page_size: params?.page_size,
    q: params?.q,
    category: params?.category,
    brand: params?.brand,
    vendor: params?.vendor,
    in_stock: params?.in_stock,
    featured: params?.featured,
    min_price: params?.min_price,
    max_price: params?.max_price,
    ordering: params?.ordering,
  });

  const raw = await apiAsync
    .get(`products/${searchParams ? `?${searchParams}` : ""}`)
    .json();

  return parseApiResponse(
    PaginatedProductListSchema,
    unwrapApiData(raw),
    "fetchProducts",
  ) as PaginatedProductList;
}

/**
 * Fetch full product detail by slug.
 * Endpoint: GET /api/v1/ninja/products/<slug>/
 */
export async function fetchProductDetail(slug: string): Promise<ProductDetail> {
  const raw = await apiAsync.get(`products/${slug}/`).json();
  return parseApiResponse(
    ProductDetailSchema,
    unwrapApiData(raw),
    "fetchProductDetail",
  ) as ProductDetail;
}

/**
 * Fetch product + reviews + wishlist status in a single HTTP call.
 * Eliminates the 3 sequential waterfall fetches on PDP.
 * Endpoint: GET /api/v1/ninja/products/<slug>/bundle/
 */
export async function fetchProductBundle(
  slug: string,
): Promise<ProductDetailBundle> {
  const raw = await apiAsync.get(`products/${slug}/bundle/`).json();
  return parseApiResponse(
    ProductDetailBundleSchema,
    unwrapApiData(raw),
    "fetchProductBundle",
  ) as ProductDetailBundle;
}

/**
 * Fetch featured / hero products.
 * Endpoint: GET /api/v1/ninja/products/featured/
 */
export async function fetchFeaturedProducts(): Promise<ProductListItem[]> {
  const raw = await apiAsync.get("products/featured/").json();
  return unwrapResults(raw).map((item) =>
    parseApiResponse(ProductListItemSchema, item, "fetchFeaturedProducts") as ProductListItem,
  );
}

/**
 * Autocomplete search suggest (lightweight — title + slug only).
 * Endpoint: GET /api/v1/ninja/products/search/suggest/?q=<query>
 */
export async function fetchSearchSuggest(
  query: string,
): Promise<Array<{ slug: string; title: string }>> {
  if (!query || query.length < 2) return [];
  const raw = await apiAsync
    .get(`products/search/suggest/?q=${encodeURIComponent(query)}`)
    .json<{ data?: Array<{ slug: string; title: string }> }>();
  return (raw as any)?.data ?? [];
}

/**
 * Fetch paginated product reviews for a PDP.
 * Endpoint: GET /api/v1/ninja/products/<slug>/reviews/
 */
export async function fetchProductReviews(
  slug: string,
  page = 1,
): Promise<PaginatedReviews> {
  const raw = await apiAsync
    .get(`products/${slug}/reviews/?page=${page}`)
    .json();
  return parseApiResponse(
    PaginatedReviewsSchema,
    unwrapApiData(raw),
    "fetchProductReviews",
  ) as PaginatedReviews;
}

// ─────────────────────────────────────────────────────────────────────────────
// WISHLIST READS  (apiAsync → Ninja)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch authenticated user's full wishlist (paginated).
 * Endpoint: GET /api/v1/ninja/products/wishlist/
 */
export async function fetchWishlist(page = 1): Promise<PaginatedWishlist> {
  const sessionKey = readAccessToken() ? undefined : getFashionistarSessionKey();
  const raw = await apiAsync
    .get("products/wishlist/", {
      ...guestOptions(),
      searchParams: {
        page,
        ...(sessionKey ? { session_key: sessionKey } : {}),
      },
    })
    .json();
  return parseApiResponse(
    PaginatedWishlistSchema,
    unwrapApiData(raw),
    "fetchWishlist",
  ) as PaginatedWishlist;
}

/**
 * Bulk check wishlist status for multiple products (for heart icons on cards).
 * Endpoint: POST /api/v1/ninja/products/wishlist/bulk/
 * Body: { slugs: string[] }
 */
export async function fetchWishlistBulkStatus(
  slugs: string[],
): Promise<WishlistBulkStatus> {
  const raw = await apiAsync
    .post("products/wishlist/bulk/", { json: { slugs } })
    .json();
  return parseApiResponse(
    WishlistBulkStatusSchema,
    unwrapApiData(raw),
    "fetchWishlistBulkStatus",
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WISHLIST WRITE  (apiSync → DRF)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Toggle wishlist membership for a product. Idempotent — add or remove.
 * Endpoint: POST /api/v1/products/<slug>/wishlist/toggle/
 */
export async function toggleWishlist(
  slug: string,
): Promise<WishlistToggleResult> {
  const { data } = await apiSync.post<WishlistToggleResult>(
    `/products/${slug}/wishlist/toggle/`,
    guestPayload(),
    guestOptions(),
  );
  return parseApiResponse(
    WishlistToggleResultSchema,
    data,
    "toggleWishlist",
  ) as WishlistToggleResult;
}

// ─────────────────────────────────────────────────────────────────────────────
// COUPON  (apiAsync → Ninja validate; apiSync → DRF create/deactivate)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate a coupon code against a cart subtotal.
 * Returns discount amount if valid.
 * Endpoint: POST /api/v1/ninja/products/coupon/validate/
 */
export async function validateCoupon(
  input: CouponValidateInput,
): Promise<CouponValidateResult> {
  const raw = await apiAsync
    .post("products/coupon/validate/", { json: input })
    .json();
  return parseApiResponse(
    CouponValidateResultSchema,
    unwrapApiData(raw),
    "validateCoupon",
  );
}

/**
 * Fetch vendor's own coupon list.
 * Endpoint: GET /api/v1/products/coupons/
 */
export async function fetchVendorCoupons(): Promise<Coupon[]> {
  const { data } = await apiSync.get<Coupon[]>("/products/coupons/");
  return (data as any[]).map((item) =>
    parseApiResponse(CouponSchema, item, "fetchVendorCoupons"),
  );
}

/**
 * Create a new coupon (vendor only).
 * Endpoint: POST /api/v1/products/coupons/
 */
export async function createCoupon(
  input: Omit<Coupon, "id" | "usage_count">,
): Promise<Coupon> {
  const { data } = await apiSync.post<Coupon>("/products/coupons/", input);
  return parseApiResponse(CouponSchema, data, "createCoupon");
}

/**
 * Deactivate/delete a coupon (vendor only).
 * Endpoint: DELETE /api/v1/products/coupons/<id>/
 */
export async function deleteCoupon(couponId: string): Promise<void> {
  await apiSync.delete(`/products/coupons/${couponId}/`);
}

// ─────────────────────────────────────────────────────────────────────────────
// VENDOR PRODUCT CRUD  (apiSync → DRF)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new product (vendor only). Sends idempotency_key to prevent duplicates.
 * Endpoint: POST /api/v1/products/vendor/
 */
export async function createProduct(
  input: CreateProductInput,
): Promise<ProductDetail> {
  const { data } = await apiSync.post<ProductDetail>(
    "/products/vendor/",
    input,
  );
  return parseApiResponse(ProductDetailSchema, data, "createProduct") as ProductDetail;
}

/**
 * Update an existing product (vendor — owner only).
 * Endpoint: PATCH /api/v1/products/vendor/<slug>/
 */
export async function updateProduct(
  slug: string,
  input: UpdateProductInput,
): Promise<ProductDetail> {
  const { data } = await apiSync.patch<ProductDetail>(
    `/products/vendor/${slug}/`,
    input,
  );
  return parseApiResponse(ProductDetailSchema, data, "updateProduct") as ProductDetail;
}

/**
 * Publish a product (vendor submits for review → status: PENDING).
 * Endpoint: POST /api/v1/products/vendor/<slug>/publish/
 */
export async function publishProduct(slug: string): Promise<ProductDetail> {
  const { data } = await apiSync.post<ProductDetail>(
    `/products/vendor/${slug}/publish/`,
  );
  return parseApiResponse(ProductDetailSchema, data, "publishProduct") as ProductDetail;
}

/**
 * Soft-delete a product (vendor owner only).
 * Endpoint: DELETE /api/v1/products/vendor/<slug>/
 */
export async function deleteProduct(slug: string): Promise<void> {
  await apiSync.delete(`/products/vendor/${slug}/`);
}

// ─────────────────────────────────────────────────────────────────────────────
// INVENTORY  (apiSync → DRF)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch paginated inventory log for a product (vendor only).
 * Endpoint: GET /api/v1/ninja/products/vendor/<slug>/inventory/
 */
export async function fetchInventoryLogs(
  slug: string,
  page = 1,
): Promise<PaginatedInventoryLogs> {
  const raw = await apiAsync
    .get(`products/vendor/${slug}/inventory/?page=${page}`)
    .json();
  return parseApiResponse(
    PaginatedInventoryLogsSchema,
    unwrapApiData(raw),
    "fetchInventoryLogs",
  ) as unknown as PaginatedInventoryLogs;
}

/**
 * Adjust product inventory (vendor only).
 * Supports positive (restock) and negative (deduction) deltas.
 * Endpoint: POST /api/v1/products/vendor/<slug>/inventory/adjust/
 */
export async function adjustInventory(
  slug: string,
  input: InventoryAdjustInput,
): Promise<ProductInventoryLog> {
  const { data } = await apiSync.post<ProductInventoryLog>(
    `/products/vendor/${slug}/inventory/adjust/`,
    input,
  );
  return parseApiResponse(
    ProductInventoryLogSchema,
    data,
    "adjustInventory",
  ) as ProductInventoryLog;
}

// ─────────────────────────────────────────────────────────────────────────────
// REVIEWS  (apiSync → DRF writes)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Submit a product review (authenticated buyer).
 * Sends idempotency_key to prevent duplicate submissions on retry.
 * Endpoint: POST /api/v1/products/<slug>/reviews/
 */
export async function createProductReview(
  slug: string,
  input: CreateReviewInput,
): Promise<ProductReview> {
  const { data } = await apiSync.post<ProductReview>(
    `/products/${slug}/reviews/`,
    input,
  );
  return parseApiResponse(ProductReviewSchema, data, "createProductReview") as ProductReview;
}

/**
 * Vendor reply to a review.
 * Endpoint: PATCH /api/v1/products/reviews/<reviewId>/reply/
 */
export async function replyToReview(
  reviewId: string,
  input: VendorReplyInput,
): Promise<ProductReview> {
  const { data } = await apiSync.patch<ProductReview>(
    `/products/reviews/${reviewId}/reply/`,
    input,
  );
  return parseApiResponse(ProductReviewSchema, data, "replyToReview") as ProductReview;
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN  (apiSync → DRF admin routes)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Admin: approve or reject a product (status mutation).
 * Endpoint: PATCH /api/v1/products/admin/<slug>/status/
 */
export async function updateProductStatus(
  slug: string,
  payload: { status: "published" | "rejected"; reason?: string },
): Promise<ProductDetail> {
  const { data } = await apiSync.patch<ProductDetail>(
    `/products/admin/${slug}/status/`,
    payload,
  );
  return parseApiResponse(ProductDetailSchema, data, "updateProductStatus") as ProductDetail;
}
