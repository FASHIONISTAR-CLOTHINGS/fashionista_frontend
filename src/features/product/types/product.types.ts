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

// NOTE: ProductColor as a separate FK model has been removed.
// Color is now stored as direct fields (color_name / color_hex) on ProductVariantGalleryMedia.



export interface ProductFaq {
  id: string;
  question: string;
  answer: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSOLIDATED VARIANT + GALLERY MEDIA
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductVariantGalleryMedia {
  id: string;
  sku: string;
  size?: ProductMeasurementGuideRow | null;
  /** Direct text field — no FK. e.g. "Midnight Blue" */
  color_name: string;
  /** Direct hex field — e.g. "#1A1A4E" */
  color_hex: string;
  media_url?: string | null;    // Cloudinary URL for gallery image/video
  media_type: MediaType;        // "image" | "video"
  alt_text: string;
  ordering: number;
  is_primary: boolean;
  video_thumbnail_url?: string | null;
  duration_sec?: number | null;
  barcode: string;
}

// Backward-compat aliases
export type ProductGalleryMedia = ProductVariantGalleryMedia;
export type ProductVariant = ProductVariantGalleryMedia;
// Kept for reference in older components still using ProductColor inline
export interface ProductColor {
  id?: string;
  name: string;
  hex_code: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT FABRIC, MEASUREMENTS & SHIPPING PROFILES (Phase 1)
// ─────────────────────────────────────────────────────────────────────────────


export interface ProductFabricSpecification {
  id: string;
  fabric_type: string;
  care_instructions: string;
  is_organic: boolean;
  is_vegan: boolean;
  country_of_origin: string;
}

export interface ProductMeasurementGuideRow {
  id: string;
  size_label: string;
  chest_cm: string;
  waist_cm: string;
  hip_cm: string;
  shoulder_cm: string;
  sleeve_cm: string;
  length_cm: string;
  inseam_cm: string;
  foot_length_cm: string;
  sort_order: number;
  template?: string | null;
}

export interface VendorMeasurementTemplateRow {
  id?: string;
  size_id?: string | null;
  size_label: string;
  chest_cm?: string;
  waist_cm?: string;
  hip_cm?: string;
  length_cm?: string;
  shoulder_cm?: string;
  sleeve_cm?: string;
  inseam_cm?: string;
  foot_length_cm?: string;
  sort_order?: number;
}

export interface VendorMeasurementTemplate {
  id: string;
  vendor_id?: string | null;
  name: string;
  description?: string;
  template_rows: VendorMeasurementTemplateRow[];
}

export interface ProductShippingProfile {
  id: string;
  weight_kg: string;
  length_cm: string;
  width_cm: string;
  height_cm: string;
  is_fragile: boolean;
  requires_signature: boolean;
  restricted_countries: string[];
  free_shipping_threshold: string | null;
  processing_days: number;
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
  is_discounted: boolean;
  discounted_price: string | null;
  cash_payment_mode: boolean;
  currency: string;
  image_url: string | null;        // Cloudinary card-size URL
  in_stock: boolean;
  stock_qty?: number;
  featured: boolean;
  hot_deal: boolean;
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
  condition?: string;
  gender_target?: string;
  age_group?: string;
  is_pre_order?: boolean;
  pre_order_date?: string | null;
  sustainability_score?: number | null;
  carbon_footprint_kg?: number | null;
  ai_trend_score?: number;
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
  price: string;
  old_price: string | null;
  discount_percentage: number;
  is_discounted: boolean;
  discounted_price: string | null;
  cash_payment_mode: boolean;
  currency: string;
  shipping_amount: string;
  image_url: string | null;
  cover_image_url: string | null;
  /** Unified variants: each item is both a product variant and a potential gallery media entry. */
  variants: ProductVariantGalleryMedia[];
  in_stock: boolean;
  stock_qty?: number;
  max_stock: number | null;
  views: number;
  orders_count: number;
  rating: number;
  review_count: number;
  computed_review_count: number;
  computed_avg_rating: number;
  featured: boolean;
  hot_deal: boolean;
  requires_measurement: boolean;
  is_customisable: boolean;
  faqs: ProductFaq[];
  status: ProductStatus;
  condition: ProductCondition;
  is_pre_order: boolean;
  pre_order_date?: string | null;
  meta_title?: string;
  meta_description?: string;
  age_group?: string;
  gender_target?: string;
  sustainability_score?: number | null;
  carbon_footprint_kg?: number | null;
  ai_trend_score?: number;
  fabric?: ProductFabricSpecification | null;
  shipping_profile?: ProductShippingProfile | null;
  measurement_guide?: ProductMeasurementGuideRow[] | null;
  categories?: Array<{ id: string; name: string; slug: string }> | null;
  sub_categories?: Array<{ id: string; name: string; slug: string }> | null;
  tags?: Array<{ id: string; name: string; slug: string }> | null;
  specifications?: Array<{ title: string; content: string }> | null;
  gallery?: Array<ProductVariantGalleryMedia> | null;
  sizes?: Array<{ id: string; name: string; size_label: string }> | null;
  colors?: Array<{ id: string; name: string; hex_code: string }> | null;
  measurement_template?: string | null;
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
  price: string;
  old_price?: string | null;
  is_discounted?: boolean;
  discount_percentage?: number | null;
  discounted_price?: string | null;
  cash_payment_mode?: string;
  currency?: string;
  shipping_amount?: string;
  max_stock?: number | null;
  condition?: ProductCondition;
  is_pre_order?: boolean;
  pre_order_date?: string | null;
  category_ids: string[];
  sub_category_ids?: string[];
  requires_measurement: boolean;
  is_customisable: boolean;
  hot_deal?: boolean;
  featured?: boolean;
  commission_rate?: string;
  status?: ProductStatus;
  meta_title?: string;
  meta_description?: string;
  age_group?: string;
  gender_target?: string;
  courier_id?: string | null;
  /** Unified variant + gallery media items to create/update. */
  variants?: Array<{
    size_id?: string | null;
    color_name?: string;          // Direct text field
    color_hex?: string;           // Direct hex field
    sku?: string;
    barcode?: string;
    media_type?: MediaType;
    alt_text?: string;
    ordering?: number;
    is_primary?: boolean;
    duration_sec?: number | null;
  }>;
  idempotency_key?: string;        // UUID v4 string
  fabric?: Omit<ProductFabricSpecification, "id"> | null;
  shipping_profile?: Omit<ProductShippingProfile, "id"> | null;
  measurement_guide?: Array<Omit<ProductMeasurementGuideRow, "id">> | null;
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
  /** Filter products by category and sub category slug (maps to category__slug on backend). */
  category?: string;
  /** Filter products by sub-category slug (maps to sub_categories__slug on backend). */
  sub_category?: string;
  brand?: string;
  vendor?: string;
  in_stock?: boolean;
  featured?: boolean;
  hot_deal?: boolean;
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

// ─────────────────────────────────────────────────────────────────────────────
// DRAFT SESSIONS
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductDraftSession {
  id: string;
  draft_key: string;
  idempotency_key: string | null;
  payload: Record<string, any>;
  current_step: number;
  status: "active" | "committed" | "discarded" | "expired";
  linked_product_id: string | null;
  expires_at: string;
  last_synced_at: string;
}
