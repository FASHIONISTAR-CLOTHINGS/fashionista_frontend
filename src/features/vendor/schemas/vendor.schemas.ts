// features/vendor/schemas/vendor.schemas.ts
// Zero-trust Zod validation aligned with /api/v1/ninja/vendor/* (async Ninja)
// and /api/v1/vendor/* (DRF sync) backend contracts.
// Last synced with: apps/vendor/types/vendor_schemas.py
import { z } from "zod";

// ── Setup State ───────────────────────────────────────────────────────────────
export const VendorSetupStateSchema = z.object({
  current_step:          z.number().default(1),
  profile_complete:      z.boolean(),
  bank_details:          z.boolean(),
  id_verified:           z.boolean(),
  first_product:         z.boolean(),
  onboarding_done:       z.boolean(),
  completion_percentage: z.number().default(0),
});

// ── Profile ───────────────────────────────────────────────────────────────────
export const VendorProfileSchema = z.object({
  id:             z.string().uuid(),
  user_id:        z.string(),
  user_email:     z.string(),
  store_name:     z.string(),
  store_slug:     z.string(),
  tagline:        z.string().default(""),
  description:    z.string().default(""),
  logo_url:       z.string().default(""),
  cover_url:      z.string().default(""),
  city:           z.string().default(""),
  state:          z.string().default(""),
  country:        z.string().default(""),
  whatsapp:       z.string().default(""),
  instagram_url:  z.string().default(""),
  tiktok_url:     z.string().default(""),
  twitter_url:    z.string().default(""),
  website_url:    z.string().default(""),
  collections:    z.array(
    z.object({
      id:    z.string(),
      title: z.string(),
      slug:  z.string(),
    }),
  ).optional(),
  total_products: z.coerce.number().default(0),
  total_sales:    z.coerce.number().default(0),
  total_revenue:  z.coerce.number().default(0),
  average_rating: z.coerce.number().default(0),
  review_count:   z.coerce.number().default(0),
  wallet_balance: z.coerce.number().default(0),
  is_verified:    z.boolean(),
  is_active:      z.boolean(),
  is_featured:    z.boolean(),
  last_active_at: z.string().nullable().optional(),
  support_rating: z.coerce.number().default(5.0),
  setup_state:    VendorSetupStateSchema.optional(),
});

// ── Dashboard Sub-Schemas ─────────────────────────────────────────────────────

/**
 * Aligned with apps/vendor/types/vendor_schemas.py: PayoutProfileOut
 * NOTE: backend uses `account_last4` (masked), NOT `account_number`.
 *       `is_verified` (not `is_complete`) is the field name on the backend.
 */
export const VendorDashboardPayoutProfileSchema = z.object({
  bank_name:               z.string().default(""),
  bank_code:               z.string().default(""),
  account_name:            z.string().default(""),
  account_last4:           z.string().default(""),           // masked last 4 digits
  paystack_recipient_code: z.string().default(""),
  is_verified:             z.boolean().default(false),        // was `is_complete` — now aligned
});

export const VendorDashboardOrderSchema = z.object({
  id:              z.union([z.string(), z.number()]),
  oid:             z.string().optional(),
  buyer_email:     z.string().optional().default(""),
  buyer_full_name: z.string().optional().default(""),
  order_status:    z.string(),
  payment_status:  z.string(),
  total_price:     z.coerce.number().optional(),
  total:           z.coerce.number().optional(),
  date:            z.string(),
});

export const VendorDashboardProductSchema = z.object({
  id:             z.string().optional(),
  pid:            z.string().optional(),
  title:          z.string(),
  price:          z.coerce.number(),
  stock_qty:      z.coerce.number(),
  status:         z.string(),
  category__name: z.string().optional(),
  date:           z.string().optional(),
  total_qty:      z.coerce.number().nullable().optional(),
});

export const VendorDashboardReviewSchema = z.object({
  id:            z.number(),
  product_title: z.string(),
  product_pid:   z.string(),
  buyer_email:   z.string(),
  rating:        z.coerce.number().min(1).max(5),
  review:        z.string(),
  date:          z.string(),
});

/**
 * Dashboard coupon stats.
 * IMPORTANT: The dashboard endpoint returns CouponStatsOut {active, inactive} counts —
 * NOT the full coupon list array. The full list comes from /api/v1/vendor/coupons/.
 */
export const VendorDashboardCouponStatsSchema = z.object({
  active:   z.number().default(0),
  inactive: z.number().default(0),
});

export const VendorWalletTransactionSchema = z.object({
  amount:           z.coerce.number(),
  transaction_type: z.string(),
  date:             z.string(),
  description:      z.string().default(""),
  reference_code:   z.string().optional(),
});

export const VendorDashboardWalletSchema = z.object({
  balance:             z.coerce.number().default(0),
  recent_transactions: z.array(VendorWalletTransactionSchema).default([]),
});

export const VendorDashboardActivitySchema = z.object({
  type:  z.string().optional(),
  label: z.string().optional(),
  date:  z.string().optional(),
}).passthrough();

export const VendorTopProductSchema = z.object({
  id:        z.string(),
  title:     z.string(),
  price:     z.coerce.number().default(0),
  stock_qty: z.coerce.number().int().default(0),
  total_qty: z.coerce.number().nullable().optional(),
});

export const VendorRevenueTrendSchema = z.object({
  month:         z.coerce.number().int().min(1).max(12),
  total_revenue: z.coerce.number().default(0),
});

/**
 * Full vendor dashboard payload.
 * Aligned with: VendorDashboardOut in apps/vendor/types/vendor_schemas.py
 *
 * Key contract rules:
 *  - profile   → dict (not full VendorProfile; includes description, social, whatsapp)
 *  - analytics → AnalyticsOut (5 numeric fields only)
 *  - coupons   → CouponStatsOut {active, inactive} — NOT an array
 *  - wallet    → WalletOut with balance + recent_transactions
 */
export const VendorDashboardSchema = z.object({
  profile: z.object({
    id:            z.string(),
    store_name:    z.string(),
    store_slug:    z.string(),
    tagline:       z.string().default(""),
    description:   z.string().default(""),
    logo_url:      z.string().default(""),
    cover_url:     z.string().default(""),
    city:          z.string().default(""),
    state:         z.string().default(""),
    country:       z.string().default(""),
    whatsapp:      z.string().default(""),
    instagram_url: z.string().default(""),
    tiktok_url:    z.string().default(""),
    twitter_url:   z.string().default(""),
    website_url:   z.string().default(""),
    is_verified:   z.boolean(),
    is_active:     z.boolean(),
    is_featured:   z.boolean(),
    last_active_at: z.string().nullable().optional(),
    support_rating: z.coerce.number().default(5.0),
  }),
  analytics: z.object({
    total_products: z.coerce.number(),
    total_sales:    z.coerce.number(),
    total_revenue:  z.coerce.number(),
    average_rating: z.coerce.number(),
    review_count:   z.coerce.number(),
  }),
  setup_state:     VendorSetupStateSchema,
  payout_profile:  VendorDashboardPayoutProfileSchema.nullable().default(null),
  recent_orders:   z.array(VendorDashboardOrderSchema).default([]),
  products:        z.array(VendorDashboardProductSchema).default([]),
  top_products:    z.array(VendorTopProductSchema).default([]),
  reviews:         z.array(VendorDashboardReviewSchema).default([]),
  coupons:         VendorDashboardCouponStatsSchema.default({ active: 0, inactive: 0 }),
  wallet:          VendorDashboardWalletSchema.nullable().default(null),
  recent_activity: z.array(VendorDashboardActivitySchema).default([]),
  low_stock_alerts: z.array(z.object({
    title:     z.string(),
    stock_qty: z.coerce.number(),
  })).default([]),
  revenue_trends:  z.array(VendorRevenueTrendSchema).default([]),
});

// ── Setup Form ────────────────────────────────────────────────────────────────
export const VendorSetupSchema = z.object({
  store_name:     z.string().min(1, "Store name is required"),
  description:    z.string().min(1, "Description is required"),
  tagline:        z.string().optional().default(""),
  logo_url:       z.string().optional().or(z.literal("")),
  cover_url:      z.string().optional().or(z.literal("")),
  city:           z.string().min(1, "City is required"),
  state:          z.string().min(1, "State is required"),
  country:        z.string().optional().default("NG"),
  collection_ids: z.array(z.string()).default([]),
  instagram_url:  z.string().optional().or(z.literal("")),
  tiktok_url:     z.string().optional().or(z.literal("")),
  twitter_url:    z.string().optional().or(z.literal("")),
  website_url:    z.string().optional().or(z.literal("")),
});

// ── Payout ────────────────────────────────────────────────────────────────────
export const VendorPayoutSchema = z.object({
  bank_name:               z.string().min(1),
  bank_code:               z.string().optional(),
  account_name:            z.string().min(1),
  account_number:          z.string().min(10, "Account number must be at least 10 digits"),
  paystack_recipient_code: z.string().optional(),
});

// ── PIN ───────────────────────────────────────────────────────────────────────
export const VendorPinSetSchema = z
  .object({
    pin:         z.string().length(4, "PIN must be exactly 4 digits").regex(/^\d+$/, "PIN must be numeric"),
    confirm_pin: z.string().length(4),
  })
  .refine((d) => d.pin === d.confirm_pin, {
    message: "PINs do not match",
    path: ["confirm_pin"],
  });

export const VendorPinVerifySchema = z.object({
  pin: z.string().length(4, "PIN must be exactly 4 digits").regex(/^\d+$/, "PIN must be numeric"),
});

// ── Product List Item ─────────────────────────────────────────────────────────
export const VendorProductListItemSchema = z.object({
  pid:            z.string(),
  title:          z.string(),
  price:          z.coerce.number(),
  stock_qty:      z.coerce.number(),
  // Backend status enum: draft | pending | published | archived | rejected
  status:         z.enum(["draft", "pending", "published", "archived", "rejected"]),
  category__name: z.string().optional(),
  date:           z.string(),
});

export const VendorProductListSchema = z.object({
  status: z.string(),
  count:  z.number(),
  data:   z.array(VendorProductListItemSchema),
});

// ── Product Create / Update ───────────────────────────────────────────────────
/**
 * VendorProductCreateSchema — aligned with backend ProductWriteSerializer.
 * Source: apps/product/serializers/product_serializers.py
 */
export const VendorProductCreateSchema = z.object({
  title:               z.string().min(1, "Product title is required"),
  description:         z.string().min(30, "Description must be at least 30 characters"),
  price:               z.string().regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid decimal string"),
  old_price:           z.string().regex(/^\d+(\.\d{1,2})?$/).optional().nullable(),
  currency:            z.string().default("NGN"),
  shipping_amount:     z.string().optional(),
  stock_qty:           z.number().int().min(0),
  max_stock:           z.number().int().nullable().optional(),
  // ── Physical attributes ──────────────────────────────────────────────────
  weight_kg:           z.string().optional().or(z.literal("")),  // e.g. "1.5"
  condition:           z.enum(["new", "used", "refurbished"]).optional().default("new"),
  is_pre_order:        z.boolean().optional().default(false),
  pre_order_date:      z.string().nullable().optional(),
  // Relations — arrays of UUID strings matching PrimaryKeyRelatedField(many=True)
  category_ids:        z.array(z.string().uuid()).min(1, "At least one category is required").max(15),
  sub_category_ids:    z.array(z.string().uuid()).optional(),
  size_ids:            z.array(z.string().uuid()).optional(),
  color_ids:           z.array(z.string().uuid()).optional(),
  tag_ids:             z.array(z.string().uuid()).optional(),
  courier_id:          z.string().uuid().nullable().optional(),  // preferred courier
  // ── Flags ────────────────────────────────────────────────────────────────
  requires_measurement: z.boolean().optional().default(false),
  is_customisable:      z.boolean().optional().default(false),
  hot_deal:             z.boolean().optional().default(false),
  digital:              z.boolean().optional().default(false),
  featured:             z.boolean().optional().default(false),
  commission_rate:      z.string().optional(),
  status:               z.enum(["draft", "pending", "published", "archived", "rejected"]).optional().default("draft"),
  idempotency_key:      z.string().uuid().optional(),
  // ── SEO overrides ────────────────────────────────────────────────────────
  meta_title:           z.string().max(160).optional().or(z.literal("")),
  meta_description:     z.string().max(320).optional().or(z.literal("")),
  age_group:            z.string().optional().or(z.literal("")),
  gender_target:        z.string().optional().or(z.literal("")),
  // ── Variants (Step 5 builder output) ────────────────────────────────────
  variants: z.array(z.object({
    size_id:        z.string().uuid().nullable().optional(),
    color_id:       z.string().uuid().nullable().optional(),
    price_override: z.string().nullable().optional(),
    stock_qty:      z.number().int().min(0).optional().default(0),
    sku:            z.string().optional(),
    is_active:      z.boolean().optional().default(true),
    weight_kg:      z.string().nullable().optional(),
    barcode:        z.string().optional(),
    is_default:     z.boolean().optional(),
    dimensions_cm:  z.record(z.string(), z.unknown()).nullable().optional(),
    notes:          z.string().optional(),
  })).optional().default([]),
});

export const VendorProductUpdateSchema = VendorProductCreateSchema.partial();

// ── Order ─────────────────────────────────────────────────────────────────────
export const VendorOrderItemSchema = z.object({
  id:            z.union([z.string(), z.number()]),
  product_title: z.string(),
  product_pid:   z.string(),
  qty:           z.number(),
  price:         z.coerce.number(),
  subtotal:      z.coerce.number(),
});

export const VendorOrderSchema = z.object({
  id:              z.union([z.string(), z.number()]),
  oid:             z.string(),
  buyer_email:     z.string(),
  buyer_full_name: z.string(),
  order_status:    z.enum(["Pending", "Processing", "Shipped", "Fulfilled", "Cancelled"]),
  payment_status:  z.enum(["paid", "pending", "failed"]),
  total_price:     z.coerce.number(),
  date:            z.string(),
  items:           z.array(VendorOrderItemSchema).optional(),
});

export const VendorOrderListSchema = z.object({
  status: z.string(),
  count:  z.number(),
  data:   z.array(VendorOrderSchema),
});

// ── Analytics ─────────────────────────────────────────────────────────────────
export const VendorAnalyticsSummarySchema = z.object({
  todays_sales:        z.coerce.number(),
  this_month_sales:    z.coerce.number(),
  year_to_date_sales:  z.coerce.number(),
  average_order_value: z.coerce.number(),
  total_customers:     z.coerce.number(),
  review_count:        z.coerce.number(),
  average_rating:      z.coerce.number(),
  active_coupons:      z.coerce.number(),
  inactive_coupons:    z.coerce.number(),
  low_stock_count:     z.coerce.number(),
  total_products:      z.coerce.number(),
  total_sales:         z.coerce.number(),
  total_revenue:       z.coerce.number(),
  wallet_balance:      z.coerce.number(),
  total_orders:        z.coerce.number(),
  avg_order_value:     z.coerce.number(),
  revenue_trend:       z.coerce.number(),
  conversion_rate:     z.coerce.number(),
});

export const VendorChartPointSchema = z.object({
  label: z.string(),
  value: z.coerce.number(),
});

export const VendorChartResponseSchema = z.object({
  status: z.string(),
  data:   z.array(VendorChartPointSchema),
});

export const VendorTopCategorySchema = z.object({
  category:     z.string(),
  total_orders: z.coerce.number(),
  revenue:      z.coerce.number(),
});

export const VendorPaymentDistributionSchema = z.object({
  method:     z.string(),
  count:      z.coerce.number(),
  percentage: z.coerce.number(),
});

// ── Earnings ──────────────────────────────────────────────────────────────────
export const VendorEarningTrackerSchema = z.object({
  total_revenue:    z.coerce.number(),
  pending_revenue:  z.coerce.number().optional().default(0),
  monthly_earnings: z.array(z.object({
    month:   z.string(),
    revenue: z.coerce.number(),
    orders:  z.coerce.number(),
  })),
});

// ── Reviews ───────────────────────────────────────────────────────────────────
export const VendorReviewItemSchema = z.object({
  id:            z.number(),
  product_title: z.string(),
  product_pid:   z.string(),
  buyer_email:   z.string(),
  rating:        z.coerce.number().min(1).max(5),
  review:        z.string(),
  date:          z.string(),
});

export const VendorReviewListSchema = z.object({
  status: z.string(),
  count:  z.number(),
  data:   z.array(VendorReviewItemSchema),
});

// ── Coupons ───────────────────────────────────────────────────────────────────
export const VendorCouponSchema = z.object({
  id:            z.union([z.string(), z.number()]),
  code:          z.string(),
  discount:      z.coerce.number(),
  discount_type: z.string().optional().default("percentage"),
  active:        z.boolean(),
  valid_until:   z.string().optional(),
});

export const VendorCouponListSchema = z.object({
  status: z.string(),
  count:  z.number(),
  data:   z.array(VendorCouponSchema),
});

// ── Inferred Types ────────────────────────────────────────────────────────────
export type VendorSetupStateInput           = z.infer<typeof VendorSetupStateSchema>;
export type VendorProfileInput              = z.infer<typeof VendorProfileSchema>;
export type VendorDashboardInput            = z.infer<typeof VendorDashboardSchema>;
export type VendorDashboardPayoutInput      = z.infer<typeof VendorDashboardPayoutProfileSchema>;
export type VendorDashboardCouponStatsInput = z.infer<typeof VendorDashboardCouponStatsSchema>;
export type VendorWalletTransactionInput    = z.infer<typeof VendorWalletTransactionSchema>;
export type VendorSetupInput                = z.infer<typeof VendorSetupSchema>;
export type VendorPayoutInput               = z.infer<typeof VendorPayoutSchema>;
export type VendorProductListItemInput      = z.infer<typeof VendorProductListItemSchema>;
export type VendorProductCreateInput        = z.infer<typeof VendorProductCreateSchema>;
export type VendorOrderInput                = z.infer<typeof VendorOrderSchema>;
export type VendorAnalyticsSummaryInput     = z.infer<typeof VendorAnalyticsSummarySchema>;
export type VendorEarningTrackerInput       = z.infer<typeof VendorEarningTrackerSchema>;
export type VendorReviewItemInput           = z.infer<typeof VendorReviewItemSchema>;
export type VendorCouponInput               = z.infer<typeof VendorCouponSchema>;
export type VendorTopProductInput           = z.infer<typeof VendorTopProductSchema>;
export type VendorRevenueTrendInput         = z.infer<typeof VendorRevenueTrendSchema>;
