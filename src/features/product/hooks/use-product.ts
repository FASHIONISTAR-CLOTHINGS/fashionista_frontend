/**
 * @file use-product.ts
 * @description TanStack Query v5 hooks for the Fashionistar Product domain.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * State ownership strategy:
 *  - Product listings, detail, bundle, reviews, wishlist → TanStack Query
 *  - UI-only state (wishlist drawer, filter panel visible) → Zustand product.store
 *  - URL filters / pagination / search → Nuqs (used in page components, not here)
 *
 * Query key convention: ["product", "entity", ...discriminators]
 *
 * Performance patterns:
 *  - useProductBundle(): single HTTP call for PDP (product + reviews + wishlist)
 *  - useWishlistBulkStatus(): one query for all heart icons on a catalog page
 *  - useSearchSuggest(): debounced autocomplete, enabled only after 2 chars
 * ────────────────────────────────────────────────────────────────────────────
 */
"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchProducts,
  fetchProductDetail,
  fetchProductBundle,
  fetchFeaturedProducts,
  fetchProductReviews,
  fetchSearchSuggest,
  fetchWishlist,
  fetchWishlistBulkStatus,
  toggleWishlist,
  validateCoupon,
  fetchVendorCoupons,
  createCoupon,
  deleteCoupon,
  createProduct,
  updateProduct,
  publishProduct,
  deleteProduct,
  adjustInventory,
  fetchInventoryLogs,
  createProductReview,
  replyToReview,
  updateProductStatus,
} from "../api/product.api";
import type {
  PaginatedProductList,
  PaginatedInventoryLogs,
  ProductDetail,
  ProductDetailBundle,
  ProductListItem,
  ProductReview,
  Coupon,
  CouponValidateResult,
  WishlistToggleResult,
  WishlistBulkStatus,
  CreateProductInput,
  UpdateProductInput,
  CreateReviewInput,
  VendorReplyInput,
  InventoryAdjustInput,
  CouponValidateInput,
  ProductFilterParams,
} from "../types/product.types";

// ─────────────────────────────────────────────────────────────────────────────
// QUERY KEY FACTORY
// ─────────────────────────────────────────────────────────────────────────────

export const productKeys = {
  all: ["product"] as const,
  // Catalog list
  lists: () => [...productKeys.all, "list"] as const,
  list: (params: object) => [...productKeys.lists(), params] as const,
  // Product detail
  details: () => [...productKeys.all, "detail"] as const,
  detail: (slug: string) => [...productKeys.details(), slug] as const,
  // Bundle (product + reviews + wishlist in one)
  bundle: (slug: string) => [...productKeys.all, "bundle", slug] as const,
  // Featured
  featured: () => [...productKeys.all, "featured"] as const,
  // Reviews
  reviews: (slug: string, page: number) =>
    [...productKeys.all, "reviews", slug, page] as const,
  // Wishlist
  wishlist: () => [...productKeys.all, "wishlist"] as const,
  wishlistBulk: (slugs: string[]) =>
    [...productKeys.all, "wishlist-bulk", ...slugs.sort()] as const,
  // Search suggest
  suggest: (q: string) => [...productKeys.all, "suggest", q] as const,
  // Coupons
  coupons: () => [...productKeys.all, "coupons"] as const,
  // Inventory logs
  inventory: (slug: string, page: number) =>
    [...productKeys.all, "inventory", slug, page] as const,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// CATALOG READ HOOKS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Paginated product listing with all supported filters.
 * Uses keepPreviousData so grid never flickers on page/filter change.
 */
export function useProducts(
  params?: ProductFilterParams,
  options?: Partial<UseQueryOptions<PaginatedProductList>>,
) {
  return useQuery<PaginatedProductList>({
    queryKey: productKeys.list(params ?? {}),
    queryFn: () => fetchProducts(params),
    staleTime: 60_000,         // 1 minute
    placeholderData: keepPreviousData,
    ...options,
  });
}

/** Single public product detail by slug. */
export function useProductDetail(
  slug: string,
  options?: Partial<UseQueryOptions<ProductDetail>>,
) {
  return useQuery<ProductDetail>({
    queryKey: productKeys.detail(slug),
    queryFn: () => fetchProductDetail(slug),
    staleTime: 120_000,        // 2 minutes
    enabled: !!slug,
    ...options,
  });
}

/**
 * PDP bundle: fetches product + reviews + wishlist status in ONE request.
 * Use this instead of 3 separate hooks for maximum performance.
 */
export function useProductBundle(
  slug: string,
  options?: Partial<UseQueryOptions<ProductDetailBundle>>,
) {
  return useQuery<ProductDetailBundle>({
    queryKey: productKeys.bundle(slug),
    queryFn: () => fetchProductBundle(slug),
    staleTime: 60_000,
    enabled: !!slug,
    ...options,
  });
}

/** Featured / hero product grid. Cached for 5 minutes. */
export function useFeaturedProducts(
  options?: Partial<UseQueryOptions<ProductListItem[]>>,
) {
  return useQuery<ProductListItem[]>({
    queryKey: productKeys.featured(),
    queryFn: fetchFeaturedProducts,
    staleTime: 300_000,
    ...options,
  });
}

/** Paginated product reviews for a PDP (separate from bundle). */
export function useProductReviews(slug: string, page = 1) {
  return useQuery({
    queryKey: productKeys.reviews(slug, page),
    queryFn: () => fetchProductReviews(slug, page),
    staleTime: 60_000,
    enabled: !!slug,
    placeholderData: keepPreviousData,
  });
}

/**
 * Autocomplete search suggestions.
 * Enabled only when query has ≥2 characters; debounce in the component layer.
 */
export function useSearchSuggest(query: string) {
  return useQuery<Array<{ slug: string; title: string }>>({
    queryKey: productKeys.suggest(query),
    queryFn: () => fetchSearchSuggest(query),
    staleTime: 30_000,
    enabled: query.length >= 2,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// WISHLIST HOOKS
// ─────────────────────────────────────────────────────────────────────────────

/** Fetch authenticated user's wishlist (paginated). */
export function useWishlist(page = 1) {
  return useQuery({
    queryKey: productKeys.wishlist(),
    queryFn: () => fetchWishlist(page),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}

/**
 * Bulk wishlist status for catalog product cards.
 * One DB query for all slugs on a page — eliminates per-card queries.
 * @param slugs Array of product slugs from the current page.
 */
export function useWishlistBulkStatus(
  slugs: string[],
  options?: Partial<UseQueryOptions<WishlistBulkStatus>>,
) {
  return useQuery<WishlistBulkStatus>({
    queryKey: productKeys.wishlistBulk(slugs),
    queryFn: () => fetchWishlistBulkStatus(slugs),
    staleTime: 60_000,
    enabled: slugs.length > 0,
    ...options,
  });
}

/**
 * Toggle wishlist add/remove with optimistic update.
 * Invalidates: wishlist, bundle, and detail queries.
 */
export function useToggleWishlist() {
  const qc = useQueryClient();
  return useMutation<WishlistToggleResult, Error, string>({
    mutationFn: toggleWishlist,
    onMutate: async (slug) => {
      // Optimistic: cancel outgoing refetches
      await qc.cancelQueries({ queryKey: productKeys.bundle(slug) });
    },
    onSuccess: (res, slug) => {
      void qc.invalidateQueries({ queryKey: productKeys.wishlist() });
      void qc.invalidateQueries({ queryKey: productKeys.bundle(slug) });
      void qc.invalidateQueries({ queryKey: productKeys.detail(slug) });
      toast.success(res.added ? "Added to wishlist ❤️" : "Removed from wishlist");
    },
    onError: () => {
      toast.error("Failed to update wishlist. Please try again.");
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// COUPON HOOKS
// ─────────────────────────────────────────────────────────────────────────────

/** Validate a coupon code for a cart subtotal (real-time check at checkout). */
export function useValidateCoupon() {
  return useMutation<CouponValidateResult, Error, CouponValidateInput>({
    mutationFn: validateCoupon,
    onError: (err) => {
      toast.error(err.message || "Invalid or expired coupon.");
    },
  });
}

/** Fetch vendor's own coupons. */
export function useVendorCoupons() {
  return useQuery<Coupon[]>({
    queryKey: productKeys.coupons(),
    queryFn: fetchVendorCoupons,
    staleTime: 120_000,
  });
}

/** Create a new coupon (vendor). */
export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCoupon,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: productKeys.coupons() });
      toast.success("Coupon created!");
    },
    onError: () => toast.error("Failed to create coupon."),
  });
}

/** Deactivate a coupon (vendor). */
export function useDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (couponId: string) => deleteCoupon(couponId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: productKeys.coupons() });
      toast.success("Coupon deactivated.");
    },
    onError: () => toast.error("Failed to deactivate coupon."),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// VENDOR PRODUCT CRUD HOOKS
// ─────────────────────────────────────────────────────────────────────────────

/** Create a new product (vendor). */
export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation<ProductDetail, Error, CreateProductInput>({
    mutationFn: createProduct,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success("Product created! It is now in draft.");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create product.");
    },
  });
}

/** Update an existing product (vendor — owner). */
export function useUpdateProduct(slug: string) {
  const qc = useQueryClient();
  return useMutation<ProductDetail, Error, UpdateProductInput>({
    mutationFn: (input) => updateProduct(slug, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: productKeys.detail(slug) });
      void qc.invalidateQueries({ queryKey: productKeys.bundle(slug) });
      void qc.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success("Product updated!");
    },
    onError: (err) => {
      toast.error(err.message || "Update failed.");
    },
  });
}

/** Submit product for review → status: PENDING. */
export function usePublishProduct(slug: string) {
  const qc = useQueryClient();
  return useMutation<ProductDetail, Error, void>({
    mutationFn: () => publishProduct(slug),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: productKeys.detail(slug) });
      toast.success("Product submitted for review!");
    },
    onError: () => toast.error("Failed to submit product."),
  });
}

/** Soft-delete a product (vendor). */
export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteProduct,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success("Product deleted.");
    },
    onError: () => toast.error("Failed to delete product."),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// INVENTORY HOOKS
// ─────────────────────────────────────────────────────────────────────────────

/** Fetch paginated inventory logs (vendor). */
export function useInventoryLogs(slug: string, page = 1) {
  return useQuery<PaginatedInventoryLogs>({
    queryKey: productKeys.inventory(slug, page),
    queryFn: () => fetchInventoryLogs(slug, page),
    staleTime: 30_000,
    enabled: !!slug,
    placeholderData: keepPreviousData,
  });
}

/**
 * Adjust inventory (restock or deduction).
 * Invalidates both the detail/bundle and inventory log queries.
 */
export function useAdjustInventory(slug: string) {
  const qc = useQueryClient();
  return useMutation<unknown, Error, InventoryAdjustInput>({
    mutationFn: (input) => adjustInventory(slug, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: productKeys.detail(slug) });
      void qc.invalidateQueries({ queryKey: productKeys.bundle(slug) });
      void qc.invalidateQueries({ queryKey: productKeys.inventory(slug, 1) });
      toast.success("Inventory updated!");
    },
    onError: (err) => {
      toast.error(err.message || "Inventory adjustment failed.");
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// REVIEW HOOKS
// ─────────────────────────────────────────────────────────────────────────────

/** Submit a product review (authenticated buyer). */
export function useCreateReview(slug: string) {
  const qc = useQueryClient();
  return useMutation<ProductReview, Error, CreateReviewInput>({
    mutationFn: (input) => createProductReview(slug, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: productKeys.reviews(slug, 1) });
      void qc.invalidateQueries({ queryKey: productKeys.bundle(slug) });
      toast.success("Review submitted! Thank you.");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to submit review.");
    },
  });
}

/** Vendor reply to a review. */
export function useReplyToReview(slug: string, reviewId: string) {
  const qc = useQueryClient();
  return useMutation<ProductReview, Error, VendorReplyInput>({
    mutationFn: (input) => replyToReview(reviewId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: productKeys.reviews(slug, 1) });
      void qc.invalidateQueries({ queryKey: productKeys.bundle(slug) });
      toast.success("Reply posted!");
    },
    onError: () => toast.error("Failed to post reply."),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN HOOKS
// ─────────────────────────────────────────────────────────────────────────────

/** Admin: approve or reject a product. */
export function useUpdateProductStatus() {
  const qc = useQueryClient();
  return useMutation<
    ProductDetail,
    Error,
    { slug: string; status: "published" | "rejected"; reason?: string }
  >({
    mutationFn: ({ slug, ...payload }) => updateProductStatus(slug, payload),
    onSuccess: (product) => {
      void qc.invalidateQueries({
        queryKey: productKeys.detail(product.slug),
      });
      void qc.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success(
        product.status === "published"
          ? "Product approved and published!"
          : "Product rejected.",
      );
    },
    onError: () => toast.error("Status update failed."),
  });
}
