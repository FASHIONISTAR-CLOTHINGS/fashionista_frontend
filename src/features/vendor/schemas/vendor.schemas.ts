// features/vendor/schemas/vendor.schemas.ts
// Zero-trust Zod validation aligned with /api/v1/vendor/* backend contracts.
import { z } from "zod";

// ── Setup State ───────────────────────────────────────────────────────────────
export const VendorSetupStateSchema = z.object({
  current_step:          z.number(),
  profile_complete:      z.boolean(),
  bank_details:          z.boolean(),
  id_verified:           z.boolean(),
  first_product:         z.boolean(),
  onboarding_done:       z.boolean(),
  completion_percentage: z.number(),
});

// ── Profile ───────────────────────────────────────────────────────────────────
export const VendorProfileSchema = z.object({
  id:             z.string().uuid(),
  user_id:        z.string().uuid(),
  user_email:     z.string(),
  store_name:     z.string(),
  store_slug:     z.string(),
  tagline:        z.string(),
  description:    z.string(),
  logo_url:       z.string(),
  cover_url:      z.string(),
  city:           z.string(),
  state:          z.string(),
  country:        z.string(),
  instagram_url:  z.string(),
  tiktok_url:     z.string(),
  twitter_url:    z.string(),
  website_url:    z.string(),
  whatsapp:       z.string().optional(),
  total_products: z.number(),
  total_sales:    z.number(),
  total_revenue:  z.number(),
  average_rating: z.number(),
  review_count:   z.number(),
  wallet_balance: z.number().optional(),
  is_verified:    z.boolean(),
  is_active:      z.boolean(),
  is_featured:    z.boolean(),
  setup_state:    VendorSetupStateSchema.optional(),
});

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const VendorDashboardSchema = z.object({
  profile: z.object({
    id:          z.string(),
    store_name:  z.string(),
    store_slug:  z.string(),
    tagline:     z.string(),
    logo_url:    z.string(),
    cover_url:   z.string(),
    city:        z.string(),
    state:       z.string(),
    country:     z.string(),
    is_verified: z.boolean(),
    is_active:   z.boolean(),
    is_featured: z.boolean(),
  }),
  analytics: z.object({
    total_products: z.number(),
    total_sales:    z.number(),
    total_revenue:  z.number(),
    average_rating: z.number(),
    review_count:   z.number(),
  }),
  setup_state:     VendorSetupStateSchema,
  recent_activity: z.array(z.unknown()),
});

// ── Setup Form ────────────────────────────────────────────────────────────────
export const VendorSetupSchema = z.object({
  store_name:    z.string().min(1, "Store name is required"),
  description:   z.string().min(1, "Description is required"),
  tagline:       z.string().optional(),
  logo_url:      z.string().url().optional().or(z.literal("")),
  cover_url:     z.string().url().optional().or(z.literal("")),
  city:          z.string().min(1, "City is required"),
  state:         z.string().min(1, "State is required"),
  country:       z.string().optional(),
  instagram_url: z.string().url().optional().or(z.literal("")),
  tiktok_url:    z.string().url().optional().or(z.literal("")),
  twitter_url:   z.string().url().optional().or(z.literal("")),
  website_url:   z.string().url().optional().or(z.literal("")),
});

// ── Payout ────────────────────────────────────────────────────────────────────
export const VendorPayoutSchema = z.object({
  bank_name:                z.string().min(1),
  bank_code:                z.string().optional(),
  account_name:             z.string().min(1),
  account_number:           z.string().min(10, "Account number must be at least 10 digits"),
  paystack_recipient_code:  z.string().optional(),
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
  pid:             z.string(),
  title:           z.string(),
  price:           z.number(),
  stock_qty:       z.number(),
  status:          z.enum(["published", "draft", "disabled", "in-review"]),
  category__name:  z.string().optional(),
  date:            z.string(),
});

export const VendorProductListSchema = z.object({
  status:  z.string(),
  count:   z.number(),
  data:    z.array(VendorProductListItemSchema),
});

// ── Product Create / Update ───────────────────────────────────────────────────
export const VendorProductCreateSchema = z.object({
  title:       z.string().min(1, "Product title is required"),
  description: z.string().min(1, "Description is required"),
  price:       z.number().positive("Price must be positive"),
  old_price:   z.number().optional(),
  category:    z.string().min(1, "Category is required"),
  tags:        z.string().optional(),
  stock_qty:   z.number().int().min(0).optional(),
  status:      z.enum(["published", "draft", "disabled", "in-review"]).optional().default("draft"),
});

export const VendorProductUpdateSchema = VendorProductCreateSchema.partial();

// ── Order ─────────────────────────────────────────────────────────────────────
export const VendorOrderItemSchema = z.object({
  id:             z.number(),
  product_title:  z.string(),
  product_pid:    z.string(),
  qty:            z.number(),
  price:          z.number(),
  subtotal:       z.number(),
});

export const VendorOrderSchema = z.object({
  id:              z.number(),
  oid:             z.string(),
  buyer_email:     z.string(),
  buyer_full_name: z.string(),
  order_status:    z.enum(["Pending", "Processing", "Shipped", "Fulfilled", "Cancelled"]),
  payment_status:  z.enum(["paid", "pending", "failed"]),
  total_price:     z.number(),
  date:            z.string(),
  items:           z.array(VendorOrderItemSchema).optional(),
});

export const VendorOrderListSchema = z.object({
  status:  z.string(),
  count:   z.number(),
  data:    z.array(VendorOrderSchema),
});

// ── Analytics ─────────────────────────────────────────────────────────────────
export const VendorAnalyticsSummarySchema = z.object({
  total_revenue:    z.number(),
  total_orders:     z.number(),
  total_products:   z.number(),
  avg_order_value:  z.number(),
  revenue_trend:    z.number(),
  conversion_rate:  z.number(),
});

export const VendorChartPointSchema = z.object({
  label: z.string(),
  value: z.number(),
});

export const VendorChartResponseSchema = z.object({
  status: z.string(),
  data:   z.array(VendorChartPointSchema),
});

export const VendorTopCategorySchema = z.object({
  category:      z.string(),
  total_orders:  z.number(),
  revenue:       z.number(),
});

export const VendorPaymentDistributionSchema = z.object({
  method:     z.string(),
  count:      z.number(),
  percentage: z.number(),
});

// ── Earnings ──────────────────────────────────────────────────────────────────
export const VendorEarningTrackerSchema = z.object({
  total_revenue:    z.number(),
  pending_revenue:  z.number().optional().default(0),
  monthly_earnings: z.array(z.object({
    month:   z.string(),
    revenue: z.number(),
    orders:  z.number(),
  })),
});

// ── Reviews ───────────────────────────────────────────────────────────────────
export const VendorReviewItemSchema = z.object({
  id:             z.number(),
  product_title:  z.string(),
  product_pid:    z.string(),
  buyer_email:    z.string(),
  rating:         z.number().min(1).max(5),
  review:         z.string(),
  date:           z.string(),
});

export const VendorReviewListSchema = z.object({
  status:  z.string(),
  count:   z.number(),
  data:    z.array(VendorReviewItemSchema),
});

// ── Coupons ───────────────────────────────────────────────────────────────────
export const VendorCouponSchema = z.object({
  id:          z.number(),
  code:        z.string(),
  discount:    z.number(),
  active:      z.boolean(),
  valid_until: z.string().optional(),
});

export const VendorCouponListSchema = z.object({
  status:  z.string(),
  count:   z.number(),
  data:    z.array(VendorCouponSchema),
});

// ── Inferred Types ────────────────────────────────────────────────────────────
export type VendorSetupStateInput         = z.infer<typeof VendorSetupStateSchema>;
export type VendorProfileInput            = z.infer<typeof VendorProfileSchema>;
export type VendorDashboardInput          = z.infer<typeof VendorDashboardSchema>;
export type VendorSetupInput              = z.infer<typeof VendorSetupSchema>;
export type VendorPayoutInput             = z.infer<typeof VendorPayoutSchema>;
export type VendorProductListItemInput    = z.infer<typeof VendorProductListItemSchema>;
export type VendorProductCreateInput      = z.infer<typeof VendorProductCreateSchema>;
export type VendorOrderInput              = z.infer<typeof VendorOrderSchema>;
export type VendorAnalyticsSummaryInput   = z.infer<typeof VendorAnalyticsSummarySchema>;
export type VendorEarningTrackerInput     = z.infer<typeof VendorEarningTrackerSchema>;
export type VendorReviewItemInput         = z.infer<typeof VendorReviewItemSchema>;
export type VendorCouponInput             = z.infer<typeof VendorCouponSchema>;
