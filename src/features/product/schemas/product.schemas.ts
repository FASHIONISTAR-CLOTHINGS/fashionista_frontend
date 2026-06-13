/**
 * @file product.schemas.ts
 * @description Zod runtime validation schemas for the Product domain.
 *
 * Every backend API response is parsed through these schemas before entering
 * TanStack Query cache. Failures are thrown loudly in development and silently
 * logged in production.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * Design rules:
 *  1. Schema names mirror TypeScript interface names with a `Schema` suffix.
 *  2. All URL fields use z.string().nullable() — Cloudinary URLs may be null
 *     when a field is optional and not yet uploaded.
 *  3. Decimal fields from Django (price, commission) are z.string() to prevent
 *     float precision loss.
 *  4. All schemas use .passthrough() so unknown backend fields don't throw.
 * ────────────────────────────────────────────────────────────────────────────
 */
import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

const IdSchema = z.string().uuid();
const DecimalStrSchema = z.string().regex(/^\d+(\.\d+)?$/, "Invalid decimal");
const IsoDateSchema = z.string().datetime({ offset: true });
const NullableUrlSchema = z.string().nullable();

export const ProductStatusSchema = z.enum([
  "draft",
  "pending",
  "published",
  "archived",
  "rejected",
]);

export const MediaTypeSchema = z.enum(["image", "video"]);
export const ProductConditionSchema = z.enum(["new", "used", "refurbished"]);

export const CouponDiscountTypeSchema = z.enum([
  "percentage",
  "fixed",
  "free_shipping",
]);

export const InventoryReasonSchema = z.enum([
  "sale",
  "return",
  "adjustment",
  "restock",
  "damaged",
  "reserved",
]);

// ─────────────────────────────────────────────────────────────────────────────
// NESTED SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const ProductCategorySchema = z
  .object({
    id: IdSchema,
    name: z.string(),
    slug: z.string(),
    image_url: NullableUrlSchema.optional(),
  })
  .passthrough();

export const ProductBrandSchema = z
  .object({
    id: IdSchema,
    name: z.string(),
    slug: z.string(),
    logo_url: NullableUrlSchema,
  })
  .passthrough();

export const ProductVendorSchema = z
  .object({
    id: IdSchema,
    store_name: z.string(),
    slug: z.string().nullable().optional(),
    avatar_url: NullableUrlSchema,
    is_verified: z.boolean().default(false),
  })
  .passthrough();

export const ProductSizeSchema = z
  .object({
    id: IdSchema,
    name: z.string(),
  })
  .passthrough();

export const ProductColorSchema = z
  .object({
    id: IdSchema,
    name: z.string(),
    hex_code: z.string(),
  })
  .passthrough();

export const ProductTagSchema = z
  .object({
    id: IdSchema,
    name: z.string(),
    slug: z.string(),
  })
  .passthrough();

export const ProductSpecificationSchema = z
  .object({
    id: IdSchema,
    title: z.string(),
    content: z.string(),
  })
  .passthrough();

export const ProductFaqSchema = z
  .object({
    id: IdSchema,
    question: z.string(),
    answer: z.string(),
  })
  .passthrough();

export const ProductMeasurementGuideSchema = z
  .object({
    id: z.string().optional(),
    size_label: z.string(),
    chest_cm: z.string().optional().default(""),
    waist_cm: z.string().optional().default(""),
    hip_cm: z.string().optional().default(""),
    shoulder_cm: z.string().optional().default(""),
    sleeve_cm: z.string().optional().default(""),
    length_cm: z.string().optional().default(""),
    inseam_cm: z.string().optional().default(""),
    foot_length_cm: z.string().optional().default(""),
    sort_order: z.number().int().default(0),
    template: z.string().uuid().nullable().optional(),
  })
  .passthrough();

export const FabricCompositionItemSchema = z.object({
  material: z.string(),
  percentage: z.number().min(0).max(100),
});

export const ProductFabricSchema = z
  .object({
    id: z.string().uuid().optional(),
    fabric_type: z.string(),
    composition: z.union([z.array(FabricCompositionItemSchema), z.record(z.string(), z.unknown())]).default([]),
    care_instructions: z.string().default("machine_wash"),
    care_notes: z.string().optional().default(""),
    is_organic: z.boolean().default(false),
    is_vegan: z.boolean().default(false),
    country_of_origin: z.string().optional().default(""),
  })
  .passthrough();

export const ProductShippingProfileSchema = z
  .object({
    id: z.string().uuid().optional(),
    weight_kg: DecimalStrSchema.default("0.00"),
    length_cm: DecimalStrSchema.default("0.00"),
    width_cm: DecimalStrSchema.default("0.00"),
    height_cm: DecimalStrSchema.default("0.00"),
    is_fragile: z.boolean().default(false),
    requires_signature: z.boolean().default(false),
    restricted_countries: z.array(z.string()).default([]),
    free_shipping_threshold: DecimalStrSchema.nullable().optional(),
    processing_days: z.number().int().min(1).default(1),
  })
  .passthrough();

export const VendorMeasurementTemplateRowSchema = z
  .object({
    id: z.string().optional(),
    size_id: z.string().uuid().nullable().optional(),
    size_label: z.string(),
    chest_cm: z.string().optional().default(""),
    waist_cm: z.string().optional().default(""),
    hip_cm: z.string().optional().default(""),
    length_cm: z.string().optional().default(""),
    shoulder_cm: z.string().optional().default(""),
    sleeve_cm: z.string().optional().default(""),
    inseam_cm: z.string().optional().default(""),
    foot_length_cm: z.string().optional().default(""),
    sort_order: z.number().int().default(0),
  })
  .passthrough();

export const VendorMeasurementTemplateSchema = z
  .object({
    id: IdSchema,
    vendor_id: IdSchema.nullable().optional(),
    name: z.string(),
    description: z.string().optional().default(""),
    template_rows: z.array(VendorMeasurementTemplateRowSchema).default([]),
  })
  .passthrough();

// ─────────────────────────────────────────────────────────────────────────────
// GALLERY MEDIA
// ─────────────────────────────────────────────────────────────────────────────

export const ProductGalleryMediaSchema = z
  .object({
    id: IdSchema,
    media_url: NullableUrlSchema,
    thumbnail_url: NullableUrlSchema,
    media_type: MediaTypeSchema,
    alt_text: z.string().default(""),
    ordering: z.number().int(),
    variant: z.string().uuid().nullable().optional(),
    color: z.string().uuid().nullable().optional(),
  })
  .passthrough();

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT
// ─────────────────────────────────────────────────────────────────────────────

export const ProductVariantSchema = z
  .object({
    id: IdSchema,
    sku: z.string(),
    size: ProductSizeSchema.nullable(),
    color: ProductColorSchema.nullable(),
    price_override: DecimalStrSchema.nullable(),
    stock_qty: z.number().int().min(0),
    is_active: z.boolean(),
    image_url: NullableUrlSchema.optional(),
    barcode: z.string().nullable().optional(),
    is_default: z.boolean().optional(),
    weight_kg: DecimalStrSchema.nullable().optional(),
    dimensions_cm: z.record(z.string(), z.unknown()).nullable().optional(),
    notes: z.string().optional().default(""),
  })
  .passthrough();

// ─────────────────────────────────────────────────────────────────────────────
// REVIEW
// ─────────────────────────────────────────────────────────────────────────────

export const ProductReviewSchema = z
  .object({
    id: IdSchema,
    reviewer_display: z.string(),
    reviewer_avatar_url: NullableUrlSchema,
    product_title: z.string().nullable().optional(),
    rating: z.number().int().min(1).max(5),
    review: z.string(),
    reply: z.string().default(""),
    helpful_votes: z.number().int().min(0),
    active: z.boolean().default(true),
    moderated: z.boolean().default(false),
    created_at: IsoDateSchema,
  })
  .passthrough();

// ─────────────────────────────────────────────────────────────────────────────
// COUPON
// ─────────────────────────────────────────────────────────────────────────────

export const CouponSchema = z
  .object({
    id: IdSchema,
    code: z.string(),
    discount_type: CouponDiscountTypeSchema,
    discount_value: DecimalStrSchema,
    minimum_order: DecimalStrSchema,
    maximum_discount: DecimalStrSchema.nullable().optional(),
    usage_limit: z.number().int().nullable(),
    usage_count: z.number().int(),
    active: z.boolean(),
    valid_from: IsoDateSchema,
    valid_to: IsoDateSchema.nullable(),
  })
  .passthrough();

export const CouponValidateResultSchema = z
  .object({
    coupon_id: IdSchema,
    code: z.string(),
    discount_type: CouponDiscountTypeSchema,
    discount_amount: DecimalStrSchema,
  })
  .passthrough();

// ─────────────────────────────────────────────────────────────────────────────
// INVENTORY LOG
// ─────────────────────────────────────────────────────────────────────────────

export const ProductInventoryLogSchema = z
  .object({
    id: IdSchema,
    quantity_delta: z.number().int(),
    quantity_before: z.number().int().min(0),
    quantity_after: z.number().int().min(0),
    reason: z.string(),
    reference_id: z.string().default(""),
    note: z.string().default(""),
    actor_name: z.string().default("System"),
    created_at: IsoDateSchema,
  })
  .passthrough();

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT LIST ITEM (catalog card — .only() projection from backend)
// ─────────────────────────────────────────────────────────────────────────────

export const ProductListItemSchema = z
  .object({
    id: IdSchema,
    title: z.string(),
    slug: z.string(),
    sku: z.string(),
    price: DecimalStrSchema,
    old_price: DecimalStrSchema.nullable(),
    discount_percentage: z.number().min(0).max(100).default(0),
    currency: z.string().default("NGN"),
    image_url: NullableUrlSchema,
    in_stock: z.boolean(),
    stock_qty: z.number().int().min(0),
    featured: z.boolean().default(false),
    hot_deal: z.boolean().default(false),
    digital: z.boolean().default(false),
    rating: z.coerce.number().min(0).max(5).default(0),
    review_count: z.coerce.number().int().min(0).default(0),
    computed_review_count: z.coerce.number().int().min(0).default(0),
    computed_avg_rating: z
      .union([z.coerce.number().min(0).max(5), z.null()])
      .transform((value) => value ?? 0),
    category_name: z.string().nullable().optional(),
    category_slug: z.string().nullable().optional(),
    brand_name: z.string().nullable().optional(),
    brand_slug: z.string().nullable().optional(),
    vendor_name: z.string().nullable().optional(),
    vendor_slug: z.string().nullable().optional(),
    requires_measurement: z.boolean().default(false),
    is_customisable: z.boolean().default(false),
    sizes: z.array(ProductSizeSchema).default([]),
    colors: z.array(ProductColorSchema).default([]),
    created_at: IsoDateSchema,
  })
  .passthrough();

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT DETAIL (full — PDP)
// ─────────────────────────────────────────────────────────────────────────────

export const ProductDetailSchema = z
  .object({
    id: IdSchema,
    title: z.string(),
    slug: z.string(),
    sku: z.string(),
    description: z.string(),
    price: DecimalStrSchema,
    old_price: DecimalStrSchema.nullable(),
    discount_percentage: z.number().min(0).max(100).default(0),
    currency: z.string().default("NGN"),
    shipping_amount: DecimalStrSchema.default("0.00"),
    image_url: NullableUrlSchema,
    cover_image_url: NullableUrlSchema.optional(),
    gallery: z.array(ProductGalleryMediaSchema).default([]),
    in_stock: z.boolean(),
    stock_qty: z.number().int().min(0),
    max_stock: z.number().int().nullable().optional(),
    views: z.number().int().min(0).default(0),
    orders_count: z.number().int().min(0).default(0),
    rating: z.coerce.number().min(0).max(5).default(0),
    review_count: z.coerce.number().int().min(0).default(0),
    computed_review_count: z.coerce.number().int().min(0).default(0),
    computed_avg_rating: z
      .union([z.coerce.number().min(0).max(5), z.null()])
      .transform((value) => value ?? 0),
    featured: z.boolean().default(false),
    hot_deal: z.boolean().default(false),
    digital: z.boolean().default(false),
    requires_measurement: z.boolean().default(false),
    is_customisable: z.boolean().default(false),
    sizes: z.array(ProductSizeSchema).default([]),
    colors: z.array(ProductColorSchema).default([]),
    tags: z.array(ProductTagSchema).default([]),
    specifications: z.array(ProductSpecificationSchema).default([]),
    faqs: z.array(ProductFaqSchema).default([]),
    variants: z.array(ProductVariantSchema).default([]),
    measurement_guide: z.array(ProductMeasurementGuideSchema).default([]),
    measurement_template: z.string().uuid().nullable().optional(),
    fabric: ProductFabricSchema.nullable().optional(),
    shipping_profile: ProductShippingProfileSchema.nullable().optional(),
    status: ProductStatusSchema,
    weight_kg: DecimalStrSchema.nullable().optional(),
    condition: ProductConditionSchema.default("new"),
    is_pre_order: z.boolean().default(false),
    pre_order_date: IsoDateSchema.nullable().optional(),
    meta_title: z.string().optional().default(""),
    meta_description: z.string().optional().default(""),
    age_group: z.string().optional().default(""),
    gender_target: z.string().optional().default(""),
    category_name: z.string().nullable().optional(),
    category_slug: z.string().nullable().optional(),
    sub_category_name: z.string().nullable().optional(),
    brand_name: z.string().nullable().optional(),
    brand_slug: z.string().nullable().optional(),
    vendor_id: IdSchema.nullable().optional(),
    vendor_name: z.string().nullable().optional(),
    vendor_slug: z.string().nullable().optional(),
    vendor_is_verified: z.boolean().default(false),
    commission_rate: DecimalStrSchema.default("0.00"),
    created_at: IsoDateSchema,
    updated_at: IsoDateSchema,
  })
  .passthrough();

// ─────────────────────────────────────────────────────────────────────────────
// BUNDLE (single-roundtrip PDP response)
// ─────────────────────────────────────────────────────────────────────────────

export const ProductDetailBundleSchema = z
  .object({
    product: ProductDetailSchema.nullable(),
    reviews: z.array(ProductReviewSchema).default([]),
    in_wishlist: z.boolean().default(false),
    review_count: z.number().int().min(0).default(0),
    avg_rating: z.number().min(0).max(5).default(0),
  })
  .passthrough();

// ─────────────────────────────────────────────────────────────────────────────
// WISHLIST
// ─────────────────────────────────────────────────────────────────────────────

export const WishlistItemSchema = z
  .object({
    id: IdSchema,
    product: ProductListItemSchema,
    created_at: IsoDateSchema,
  })
  .passthrough();

export const WishlistToggleResultSchema = z
  .object({
    added: z.boolean(),
    message: z.string().default(""),
  })
  .passthrough();

export const WishlistBulkStatusSchema = z
  .object({
    statuses: z.record(z.string(), z.boolean()),
  })
  .passthrough();

// ─────────────────────────────────────────────────────────────────────────────
// PAGINATED ENVELOPES
// ─────────────────────────────────────────────────────────────────────────────

function paginatedSchema<T>(itemSchema: z.ZodType<T>) {
  return z.object({
    count: z.number().int().min(0),
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(itemSchema),
  });
}

export const PaginatedProductListSchema = paginatedSchema(ProductListItemSchema);
export const PaginatedReviewsSchema = paginatedSchema(ProductReviewSchema);
export const PaginatedInventoryLogsSchema = paginatedSchema(ProductInventoryLogSchema);
export const PaginatedWishlistSchema = paginatedSchema(WishlistItemSchema);

// ─────────────────────────────────────────────────────────────────────────────
// FORM VALIDATION SCHEMAS (client-side forms)
// ─────────────────────────────────────────────────────────────────────────────

export const CreateReviewFormSchema = z.object({
  rating: z.number().int().min(1, "Please give a rating").max(5),
  review: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(2000, "Review is too long"),
  idempotency_key: z.string().uuid().optional(),
});

export const InventoryAdjustFormSchema = z.object({
  quantity_delta: z
    .number()
    .int()
    .refine((n) => n !== 0, "Delta cannot be zero"),
  reason: z.string().min(2),
  reference_id: z.string().optional(),
  note: z.string().max(500).optional(),
});

export const CouponValidateFormSchema = z.object({
  code: z.string().min(3, "Enter a valid coupon code").toUpperCase(),
  order_subtotal: z.number().positive("Order total must be positive"),
});

// ─────────────────────────────────────────────────────────────────────────────
// PARSE HELPER — throws in dev, logs in prod
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse a backend API response through a Zod schema.
 * Development: throws with full error details for fast feedback.
 * Production: logs error and returns raw data cast to avoid blank screens.
 */
export function parseApiResponse<T>(
  schema: z.ZodType<T>,
  data: unknown,
  context?: string,
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const msg = `[Zod] Schema mismatch${context ? ` in ${context}` : ""}: ${result.error.message}`;
    if (process.env.NODE_ENV === "development") {
      console.error(msg, result.error.flatten(), data);
      throw new Error(msg);
    }
    console.warn(msg);
    // Return raw data in production to prevent blank screens
    return data as T;
  }
  return result.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// DRAFT SESSIONS
// ─────────────────────────────────────────────────────────────────────────────

export const ProductDraftSessionSchema = z
  .object({
    id: z.string(),
    draft_key: z.string(),
    idempotency_key: z.string().nullable().optional(),
    payload: z.record(z.string(), z.any()),
    current_step: z.number().int(),
    status: z.enum(["active", "committed", "discarded", "expired"]),
    linked_product_id: z.string().nullable().optional(),
    expires_at: z.string(),
    last_synced_at: z.string(),
  })
  .passthrough();

