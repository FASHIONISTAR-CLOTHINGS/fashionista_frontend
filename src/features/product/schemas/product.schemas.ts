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

/**
 * Cash payment mode enum — mirrors Product.CashPaymentMode on the backend.
 * 'both' has been removed; all real modes are now first-class choices.
 */
export const CashPaymentModeSchema = z.enum([
  "disabled",
  "cod",
  "pay_at_shop",
  "payment_on_delivery",
  "payment_before_delivery",
  "part_payment_before_delivery",
  "allow_all",
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


// NOTE: ProductColor as a separate FK model has been removed.
// Color is now stored as direct fields (color_name / color_hex) on ProductVariantGalleryMedia.

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
    size_label: z.enum(["XS", "S", "M", "L", "XL", "XXL", "Custom"]),
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


export const ProductFabricSpecificationSchema = z
  .object({
    id: z.string().uuid().optional(),
    fabric_type: z.string(),
    care_instructions: z.string().default("machine_wash"),
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
// CONSOLIDATED VARIANT + GALLERY MEDIA
// ─────────────────────────────────────────────────────────────────────────────

export const ProductVariantGalleryMediaSchema = z
  .object({
    id: IdSchema,
    public_id: z.string().nullable().optional(),
    sku: z.string(),
    size: ProductMeasurementGuideSchema.nullable().optional(),
    /** Direct text field — no FK. e.g. "Midnight Blue" */
    color_name: z.string().default(""),
    /** Direct hex field — e.g. "#1A1A4E" */
    color_hex: z.string().default(""),
    stock_qty: z.number().int().min(0).default(0),
    media_url: NullableUrlSchema.optional(),
    media_type: MediaTypeSchema.default("image"),
    alt_text: z.string().default(""),
    ordering: z.number().int().default(0),
    is_primary: z.boolean().default(false),
    video_thumbnail_url: NullableUrlSchema.optional(),
    duration_sec: z.number().int().nullable().optional(),
    barcode: z.string().default(""),
    notes: z.string().default(""),
  })
  .passthrough();

// Backward-compat alias (old gallery item shape — now unified with variant)
export const ProductGalleryMediaSchema = ProductVariantGalleryMediaSchema;
// Backward-compat alias (old variant shape — now unified with gallery media)
export const ProductVariantSchema = ProductVariantGalleryMediaSchema;

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
    // NOTE: sku removed from Product — each variant carries its own SKU
    price: DecimalStrSchema,
    old_price: DecimalStrSchema.nullable(),
    discount_percentage: z.coerce.number().min(0).max(100).nullable().transform((val) => val ?? 0).default(0),
    /** Computed discount flag from the backend serializer */
    is_discounted: z.boolean().default(false),
    /** Computed discounted price string */
    discounted_price: DecimalStrSchema.nullable().optional(),
    /** Cash payment mode string — matches CashPaymentMode backend enum choices. */
    cash_payment_mode: z.string().default("disabled"),
    currency: z.string().default("NGN"),
    image_url: NullableUrlSchema,
    in_stock: z.boolean(),
    stock_qty: z.number().int().min(0).default(0),
    featured: z.boolean().default(false),
    hot_deal: z.boolean().default(false),
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
    condition: z.string().optional().default("new"),
    gender_target: z.string().optional().default(""),
    age_group: z.string().optional().default(""),
    is_pre_order: z.boolean().default(false),
    pre_order_date: z.string().nullable().optional(),
    sustainability_score: z.coerce.number().nullable().optional(),
    carbon_footprint_kg: z.coerce.number().nullable().optional(),
    ai_trend_score: z.coerce.number().default(0),
    /** color swatches for this product (derived from gallery) */
    colors: z
      .array(
        z.object({
          color_name: z.string().optional(),
          color_hex: z.string().optional(),
          name: z.string().optional(),
          hex_code: z.string().optional(),
        }).passthrough()
      )
      .transform((items) =>
        items.map((item) => ({
          color_name: item.color_name || item.name || "",
          color_hex: item.color_hex || item.hex_code || "",
        }))
      )
      .default([]),
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
    // NOTE: sku removed from Product — each variant carries its own SKU
    description: z.string(),
    price: DecimalStrSchema,
    old_price: DecimalStrSchema.nullable(),
    discount_percentage: z.coerce.number().min(0).max(100).nullable().transform((val) => val ?? 0).default(0),
    /** Computed discount flag from the backend serializer */
    is_discounted: z.boolean().default(false),
    /** Computed discounted price string */
    discounted_price: DecimalStrSchema.nullable().optional(),
    /** Cash payment mode string — matches CashPaymentMode backend enum choices. */
    cash_payment_mode: z.string().default("disabled"),
    currency: z.string().default("NGN"),
    shipping_amount: DecimalStrSchema.default("0.00"),
    image_url: NullableUrlSchema,
    cover_image_url: NullableUrlSchema.optional(),
    /** gallery = ProductVariantGalleryMedia rows (canonical field name) */
    gallery: z.array(ProductVariantGalleryMediaSchema).default([]),
    /** variants = backward-compat alias for gallery */
    variants: z.array(ProductVariantGalleryMediaSchema).default([]),
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
    requires_measurement: z.boolean().default(false),
    is_customisable: z.boolean().default(false),
    tags: z.array(ProductTagSchema).default([]),
    specifications: z.array(ProductSpecificationSchema).default([]),
    faqs: z.array(ProductFaqSchema).default([]),
    measurement_guide: z.array(ProductMeasurementGuideSchema).default([]),
    measurement_template: z.string().uuid().nullable().optional(),
    fabric: ProductFabricSpecificationSchema.nullable().optional(),
    shipping_profile: ProductShippingProfileSchema.nullable().optional(),
    status: ProductStatusSchema,
    weight_kg: DecimalStrSchema.nullable().optional(),
    condition: ProductConditionSchema.default("new"),
    is_pre_order: z.boolean().default(false),
    pre_order_date: z.string().nullable().optional(),
    meta_title: z.string().optional().default(""),
    meta_description: z.string().optional().default(""),
    age_group: z.string().optional().default(""),
    gender_target: z.string().optional().default(""),
    sustainability_score: z.coerce.number().nullable().optional(),
    carbon_footprint_kg: z.coerce.number().nullable().optional(),
    ai_trend_score: z.coerce.number().default(0),
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

function paginatedSchema<T>(itemSchema: z.ZodType<T, any, any>) {
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
  schema: z.ZodType<T, any, any>,
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


