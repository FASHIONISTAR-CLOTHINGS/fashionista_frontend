/**
 * @file product.types.ts
 * @description Canonical TypeScript types for the Fashionistar Product domain.
 *
 * These types mirror the backend serializer/schema response shapes exactly.
 * Source of truth:
 *   DRF sync  → apps/product/serializers/product_serializers.py
 *   Ninja async → apps/product/schemas/product_schemas.py
 *
 * ────────────────────────────────────────────────────────────────
 * Aligned backend fields in this version:
 * - ProductListItem mirrors ProductListSerializer + ProductListItemOut
 * - ProductDetail mirrors ProductDetailSerializer + ProductDetailOut
 * - ProductReview mirrors ProductReviewSerializer + ProductReviewOut
 * - ProductDetailBundle mirrors ProductDetailBundleOut
 * - InventoryLog mirrors ProductInventoryLogSerializer + ProductInventoryLogOut
 * - WishlistBulkStatus mirrors WishlistBulkStatusOut
 * - CouponValidate mirrors CouponValidateOut
 * ────────────────────────────────────────────────────────────────
 */

// ─────────────────────────────────────────────────────────────────────────────
// ENUM LITERALS
// ─────────────────────────────────────────────────────────────────────────────

export type ProductStatus =
  | "draft"
  | "pending"
  | "published"
  | "archived"
  | "rejected";

export type ProductCondition = "new" | "used" | "refurbished";
export type CouponDiscountType = "percentage" | "fixed" | "free_shipping";
export type MediaType = "image" | "video";
export type InventoryReason =
  | "sale"
  | "return"
  | "adjustment"
  | "restock"
  | "damaged"
  | "reserved";

// ─────────────────────────────────────────────────────────────────────────────
// NESTED REFERENCE TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  image_url?: string | null;
}

export interface ProductBrand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

export interface ProductVendor {
  id: string;
  store_name: string;
  slug: string | null;
  avatar_url: string | null;
  is_verified: boolean;
}

export interface ProductSize {
  id: string;
  name: string;
}

export interface ProductColor {
  id: string;
  name: string;
  hex_code: string;
}

export interface ProductTag {
  id: string;
  name: string;
  slug: string;
}

export interface ProductSpecification {
  id: string;
  title: string;
  content: string;
}

export interface ProductFaq {
  id: string;
  question: string;
  answer: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// GALLERY MEDIA
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductGalleryMedia {
  id: string;
  media_url: string | null;       // Full Cloudinary secure_url (auto q/f)
  thumbnail_url: string | null;   // Cloudinary 400×400 thumb URL
  media_type: MediaType;
  alt_text: string;
  ordering: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT VARIANT
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductVariant {
  id: string;
  sku: string;
  size: ProductSize | null;
  color: ProductColor | null;
  price_override: string | null;  // Decimal string e.g. "25000.00"
  stock_qty: number;
  is_active: boolean;
  image_url: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT REVIEW
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductReview {
  id: string;
  reviewer_display: string;         // Snapshot name (never live FK)
  reviewer_avatar_url: string | null;
  product_title: string | null;
  rating: number;                   // 1–5
  review: string;
  reply: string;                    // Vendor reply (empty string if none)
  helpful_votes: number;
  active: boolean;
  moderated: boolean;
  created_at: string;               // ISO 8601
}

// ─────────────────────────────────────────────────────────────────────────────
// COUPON
// ─────────────────────────────────────────────────────────────────────────────

export interface Coupon {
  id: string;
  code: string;
  discount_type: CouponDiscountType;
  discount_value: string;     // Decimal string
  minimum_order: string;
  maximum_discount?: string | null;
  usage_limit: number | null;
  usage_count: number;
  active: boolean;
  valid_from: string;         // ISO 8601
  valid_to: string | null;
}

export interface CouponValidateResult {
  coupon_id: string;
  code: string;
  discount_type: CouponDiscountType;
  discount_amount: string;    // Decimal string
}

// ─────────────────────────────────────────────────────────────────────────────
// INVENTORY LOG
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductInventoryLog {
  id: string;
  quantity_delta: number;
  quantity_before: number;
  quantity_after: number;
  reason: InventoryReason | string;
  reference_id: string;
  note: string;
  actor_name: string;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT LIST ITEM (lightweight — for catalog cards)
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductListItem {
  id: string;
  title: string;
  slug: string;
  sku: string;
  price: string;                   // Decimal string
  old_price: string | null;
  discount_percentage: number;
  currency: string;
  image_url: string | null;        // Cloudinary card-size URL
  in_stock: boolean;
  stock_qty: number;
  featured: boolean;
  hot_deal: boolean;
  digital: boolean;
  rating: number;
  review_count: number;
  computed_review_count: number;   // From DB annotation
  computed_avg_rating: number;
  category_name: string | null;
  category_slug: string | null;
  brand_name: string | null;
  brand_slug: string | null;
  vendor_name: string | null;
  vendor_slug: string | null;
  requires_measurement: boolean;
  is_customisable: boolean;
  sizes: ProductSize[];
  colors: ProductColor[];
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT DETAIL (full — for PDP)
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductDetail {
  id: string;
  title: string;
  slug: string;
  sku: string;
  description: string;
  short_description: string;
  price: string;
  old_price: string | null;
  discount_percentage: number;
  currency: string;
  shipping_amount: string;
  image_url: string | null;
  cover_image_url: string | null;
  gallery: ProductGalleryMedia[];
  in_stock: boolean;
  stock_qty: number;
  max_stock: number | null;
  views: number;
  orders_count: number;
  rating: number;
  review_count: number;
  computed_review_count: number;
  computed_avg_rating: number;
  featured: boolean;
  hot_deal: boolean;
  digital: boolean;
  requires_measurement: boolean;
  is_customisable: boolean;
  sizes: ProductSize[];
  colors: ProductColor[];
  tags: ProductTag[];
  specifications: ProductSpecification[];
  faqs: ProductFaq[];
  variants: ProductVariant[];
  status: ProductStatus;
  category_name: string | null;
  category_slug: string | null;
  sub_category_name: string | null;
  brand_name: string | null;
  brand_slug: string | null;
  vendor_id: string | null;
  vendor_name: string | null;
  vendor_slug: string | null;
  vendor_is_verified: boolean;
  commission_rate: string;
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// BUNDLE (product + reviews + wishlist in one HTTP response)
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductDetailBundle {
  product: ProductDetail | null;
  reviews: ProductReview[];
  in_wishlist: boolean;
  review_count: number;
  avg_rating: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// WISHLIST
// ─────────────────────────────────────────────────────────────────────────────

export interface WishlistItem {
  id: string;
  product: ProductListItem;
  created_at: string;
}

export interface WishlistToggleResult {
  added: boolean;
  message: string;
}

export interface WishlistBulkStatus {
  statuses: Record<string, boolean>; // slug → is_wishlisted
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGINATED RESPONSE ENVELOPES
// ─────────────────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type PaginatedProductList = PaginatedResponse<ProductListItem>;
export type PaginatedReviews = PaginatedResponse<ProductReview>;
export type PaginatedInventoryLogs = PaginatedResponse<ProductInventoryLog>;
export type PaginatedWishlist = PaginatedResponse<WishlistItem>;

// ─────────────────────────────────────────────────────────────────────────────
// FORM INPUT TYPES (frontend → backend POST/PATCH)
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateProductInput {
  title: string;
  description: string;
  short_description?: string;
  price: string;
  old_price?: string;
  currency?: string;
  shipping_amount?: string;
  stock_qty: number;
  max_stock?: number | null;
  category_ids: string[];
  sub_category_ids?: string[];
  size_ids?: string[];
  color_ids?: string[];
  tag_ids?: string[];
  requires_measurement: boolean;
  is_customisable: boolean;
  hot_deal?: boolean;
  digital?: boolean;
  commission_rate?: string;
  idempotency_key?: string;        // UUID v4 string
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}

export interface CreateReviewInput {
  rating: number;                  // 1–5
  review: string;                  // min 10 chars
  idempotency_key?: string;        // UUID v4 string
}

export interface VendorReplyInput {
  reply: string;
}

export interface InventoryAdjustInput {
  quantity_delta: number;          // Positive = restock, Negative = deduction
  reason: InventoryReason | string;
  reference_id?: string;
  note?: string;
}

export interface CouponValidateInput {
  code: string;
  order_subtotal: number;
}

export interface ProductFilterParams {
  q?: string;
  category?: string;
  brand?: string;
  vendor?: string;
  in_stock?: boolean;
  featured?: boolean;
  min_price?: string;
  max_price?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// API RESPONSE WRAPPER (matches backend success_response shape)
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  status_code?: number;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
