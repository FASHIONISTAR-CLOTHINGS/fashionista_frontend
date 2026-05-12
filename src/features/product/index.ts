/**
 * @file index.ts
 * @description Public API for the `features/product` canonical FSD slice.
 *
 * Import rule: external code MUST import from this index, never from
 * internal paths. This enforces slice boundary isolation.
 *
 * @example
 *   import { useProductBundle, useWishlistBulkStatus, productKeys } from "@/features/product";
 */

// ── Types ──────────────────────────────────────────────────────────────────
export type {
  // Enums
  ProductStatus,
  ProductCondition,
  CouponDiscountType,
  MediaType,
  InventoryReason,
  // Nested
  ProductCategory,
  ProductBrand,
  ProductVendor,
  ProductSize,
  ProductColor,
  ProductTag,
  ProductSpecification,
  ProductFaq,
  ProductGalleryMedia,
  ProductVariant,
  // Core
  ProductListItem,
  ProductDetail,
  ProductDetailBundle,
  ProductReview,
  ProductInventoryLog,
  // Wishlist
  WishlistItem,
  WishlistToggleResult,
  WishlistBulkStatus,
  // Coupon
  Coupon,
  CouponValidateResult,
  // Paginated envelopes
  PaginatedResponse,
  PaginatedProductList,
  PaginatedReviews,
  PaginatedInventoryLogs,
  PaginatedWishlist,
  // Form inputs
  CreateProductInput,
  UpdateProductInput,
  CreateReviewInput,
  VendorReplyInput,
  InventoryAdjustInput,
  CouponValidateInput,
  ProductFilterParams,
  // API response wrapper
  ApiResponse,
  ApiSuccessResponse,
  ApiErrorResponse,
} from "./types/product.types";

// ── Schemas (Zod) ──────────────────────────────────────────────────────────
export {
  ProductStatusSchema,
  ProductListItemSchema,
  ProductDetailSchema,
  ProductDetailBundleSchema,
  ProductReviewSchema,
  WishlistBulkStatusSchema,
  WishlistToggleResultSchema,
  CouponSchema,
  CouponValidateResultSchema,
  ProductInventoryLogSchema,
  PaginatedProductListSchema,
  PaginatedReviewsSchema,
  PaginatedInventoryLogsSchema,
  // Form validation schemas
  CreateReviewFormSchema,
  InventoryAdjustFormSchema,
  CouponValidateFormSchema,
  // Parse helper
  parseApiResponse,
} from "./schemas/product.schemas";

// ── API Functions (raw — prefer hooks in client components) ───────────────
export {
  // Public reads (Ninja async)
  fetchProducts,
  fetchProductDetail,
  fetchProductBundle,
  fetchFeaturedProducts,
  fetchProductReviews,
  fetchSearchSuggest,
  // Wishlist
  fetchWishlist,
  fetchWishlistBulkStatus,
  toggleWishlist,
  // Coupon
  validateCoupon,
  fetchVendorCoupons,
  createCoupon,
  deleteCoupon,
  // Vendor CRUD (DRF sync)
  createProduct,
  updateProduct,
  publishProduct,
  deleteProduct,
  // Inventory
  fetchInventoryLogs,
  adjustInventory,
  // Review
  createProductReview,
  replyToReview,
  // Admin
  updateProductStatus,
} from "./api/product.api";

// ── TanStack Query Hooks ───────────────────────────────────────────────────
export {
  // Cache key factory
  productKeys,
  // Catalog reads
  useProducts,
  useProductDetail,
  useProductBundle,
  useFeaturedProducts,
  useProductReviews,
  useSearchSuggest,
  // Wishlist
  useWishlist,
  useWishlistBulkStatus,
  useToggleWishlist,
  // Coupon
  useValidateCoupon,
  useVendorCoupons,
  useCreateCoupon,
  useDeleteCoupon,
  // Vendor CRUD
  useCreateProduct,
  useUpdateProduct,
  usePublishProduct,
  useDeleteProduct,
  // Inventory
  useInventoryLogs,
  useAdjustInventory,
  // Review
  useCreateReview,
  useReplyToReview,
  // Admin
  useUpdateProductStatus,
} from "./hooks/use-product";

// ── URL State Hooks ────────────────────────────────────────────────────────
export { useProductFilters } from "./hooks/use-product-filters";

// ── Zustand UI Store ───────────────────────────────────────────────────────
export { useProductStore } from "./store/product.store";

// ── Components ─────────────────────────────────────────────────────────────
export { default as ReviewCard } from "./components/ReviewCard";
export { default as ReviewScroll } from "./components/ReviewScroll";
export { default as WishlistTableCell } from "./components/WishlistTableCell";
export { default as ProductCard } from "./components/ProductCard";
export {
  default as ProductCardSkeleton,
  ProductGridSkeleton,
} from "./components/ProductCardSkeleton";
export { default as ProductGrid } from "./components/ProductGrid";

// ── Vendor Product Builder (8-step enterprise builder) ────────────────────
export {
  // Orchestrator
  ProductBuilder,
  // Provider + context hook
  ProductBuilderProvider,
  useBuilderContext,
  // Individual step components
  Step1BasicInfo,
  Step2Pricing,
  Step3Gallery,
  Step4SizesColors,
  Step5Variants,
  Step6Specifications,
  Step7Faqs,
  Step8Publish,
  // Stepper nav
  BuilderStepper,
  // Schemas + metadata
  ProductBuilderFormSchema,
  BUILDER_STEPS,
  TOTAL_STEPS,
  builderProgress,
} from "./builder";
export type {
  ProductBuilderFormValues,
  Step1Values,
  Step2Values,
  Step3Values,
  Step4Values,
  Step5Values,
  Step6Values,
  Step7Values,
  Step8Values,
  GalleryItem,
  VariantRow,
  SpecRow,
  FaqRow,
  StepMeta,
} from "./builder";
