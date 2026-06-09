// features/vendor/types/vendor.types.ts
// TypeScript interfaces aligned with backend contracts:
//   - /api/v1/ninja/vendor/* (Django-Ninja async — source of truth for dashboard)
//   - /api/v1/vendor/*       (DRF sync — mutations, lists)
// Last synced with: apps/vendor/types/vendor_schemas.py

export type VendorOnboardingStatus =
  | "not_started"
  | "draft"
  | "submitted"
  | "active"
  | "restricted";

/**
 * ProductStatus mirrors the backend Product.ProductStatus choices exactly.
 * Backend model: apps/product/models.py
 *   DRAFT      = "draft"
 *   PENDING    = "pending"   (formerly "in-review" in legacy frontend)
 *   PUBLISHED  = "published"
 *   ARCHIVED   = "archived"  (formerly "disabled" in legacy frontend)
 *   REJECTED   = "rejected"
 */
export type ProductStatus   = "draft" | "pending" | "published" | "archived" | "rejected";
export type OrderStatus     = "Pending" | "Processing" | "Shipped" | "Fulfilled" | "Cancelled";
export type VendorOrderStatus = OrderStatus;
export type PaymentStatus   = "paid" | "pending" | "failed";

// ── Setup State ───────────────────────────────────────────────────────────────
export interface VendorSetupState {
  current_step:          number;
  profile_complete:      boolean;
  bank_details:          boolean;
  id_verified:           boolean;  // informational: future KYC, does NOT gate dashboard access
  first_product:         boolean;
  onboarding_done:       boolean;
  completion_percentage: number;   // computed: 0–100
}

// ── Profile ───────────────────────────────────────────────────────────────────
export interface VendorProfile {
  id:            string;
  user_id:       string;
  user_email:    string;
  store_name:    string;
  store_slug:    string;
  tagline:       string;
  description:   string;
  logo_url:      string;
  cover_url:     string;
  city:          string;
  state:         string;
  country:       string;
  whatsapp:      string;
  instagram_url: string;
  tiktok_url:    string;
  twitter_url:   string;
  website_url:   string;
  collections?: Array<{
    id:    string;
    title: string;
    slug:  string;
  }>;
  total_products: number;
  total_sales:    number;
  total_revenue:  number;
  average_rating: number;
  review_count:   number;
  wallet_balance: number;
  is_verified:    boolean;
  is_active:      boolean;
  is_featured:    boolean;
  setup_state?:   VendorSetupState;
}

// ── Payout Profile (Dashboard sub-object) ─────────────────────────────────────
/**
 * Aligned with PayoutProfileOut in apps/vendor/types/vendor_schemas.py.
 * account_last4 is the masked last-4 digits (NOT the full account_number).
 * is_verified (not is_complete) is the canonical field name.
 */
export interface VendorPayoutProfile {
  bank_name:               string;
  bank_code:               string;
  account_name:            string;
  account_last4:           string;   // masked — backend never returns full account number
  paystack_recipient_code: string;
  is_verified:             boolean;
}

// ── Coupon Stats (Dashboard sub-object) ───────────────────────────────────────
/**
 * The dashboard endpoint returns coupon COUNTS (CouponStatsOut), not the full list.
 * Full coupon list comes from /api/v1/vendor/coupons/.
 */
export interface VendorCouponStats {
  active:   number;
  inactive: number;
}

// ── Wallet ────────────────────────────────────────────────────────────────────
export interface VendorWalletTransaction {
  amount:           number;
  transaction_type: string;
  date:             string;
  description:      string;
  reference_code?:  string;
}

export interface VendorWallet {
  balance:             number;
  recent_transactions: VendorWalletTransaction[];
}

export interface VendorTopProduct {
  id:        string;
  title:     string;
  price:     number;
  stock_qty: number;
  total_qty: number | null;
}

export interface VendorRevenueTrend {
  month:         number;
  total_revenue: number;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
/**
 * Full vendor dashboard payload from GET /api/v1/ninja/vendor/dashboard/
 * Aligned with VendorDashboardOut in apps/vendor/types/vendor_schemas.py
 */
export interface VendorDashboard {
  profile: {
    id:            string;
    store_name:    string;
    store_slug:    string;
    tagline:       string;
    description:   string;
    logo_url:      string;
    cover_url:     string;
    city:          string;
    state:         string;
    country:       string;
    whatsapp:      string;
    instagram_url: string;
    tiktok_url:    string;
    twitter_url:   string;
    website_url:   string;
    is_verified:   boolean;
    is_active:     boolean;
    is_featured:   boolean;
  };
  analytics: {
    total_products: number;
    total_sales:    number;
    total_revenue:  number;
    average_rating: number;
    review_count:   number;
  };
  setup_state:    VendorSetupState;
  payout_profile: VendorPayoutProfile | null;

  recent_orders:  Array<{
    id:              number;
    oid?:            string;
    buyer_email:     string;
    buyer_full_name: string;
    order_status:    string;
    payment_status:  string;
    total_price?:    number;
    total?:          number;
    date:            string;
  }>;
  products: Array<{
    id?:            string;
    pid?:           string;
    title:          string;
    price:          number;
    stock_qty:      number;
    status:         string;
    category__name?: string;
    date?:          string;
    total_qty?:     number | null;
  }>;
  top_products:    VendorTopProduct[];
  reviews: VendorReviewItem[];
  /**
   * Note: This is coupon STATS (active/inactive count), not the full coupon list.
   * Use vendorApi.getCoupons() for the paginated list.
   */
  coupons:          VendorCouponStats;
  wallet:           VendorWallet | null;
  recent_activity:  Array<{
    type?:  string;
    label?: string;
    date?:  string;
    [key: string]: unknown;
  }>;
  /** Products below the low-stock threshold (stock_qty < 5). */
  low_stock_alerts: Array<{
    title:     string;
    stock_qty: number;
  }>;
  revenue_trends:  VendorRevenueTrend[];
}

// ── Products ──────────────────────────────────────────────────────────────────
export interface VendorProductListItem {
  pid:            string;
  title:          string;
  price:          number;
  stock_qty:      number;
  status:         ProductStatus;
  category__name?: string;
  date:           string;
}

/**
 * VendorProductCreatePayload — aligned with ProductWriteSerializer.
 * Source of truth: apps/product/serializers/product_serializers.py
 *
 * Key differences from legacy shape:
 *   - category_ids: string[]  (was: category: string — singular)
 *   - tag_ids: string[]       (was: tags: string — CSV)
 *   - size_ids: string[]      (was: sizes: {name,price}[] — embedded objects)
 *   - color_ids: string[]     (was: colors: {name,hex}[] — embedded objects)
 *   - price: string           (decimal string, not number, to match DRF DecimalField)
 *   - shipping_amount: string (decimal string)
 *   - variants: handled separately via ProductBuilderProvider
 */
export interface VendorProductCreatePayload {
  title:                 string;
  description:           string;
  short_description?:    string;
  price:                 string;         // Decimal string e.g. "25000.00"
  old_price?:            string | null;  // Decimal string or null
  currency?:             string;         // default "NGN"
  shipping_amount?:      string;         // Decimal string
  stock_qty:             number;
  max_stock?:            number | null;
  // Relations — all sent as arrays of UUID strings (PrimaryKeyRelatedField many=True)
  weight_kg?:            string | null;
  condition?:            "new" | "used" | "refurbished";
  is_pre_order?:         boolean;
  pre_order_date?:       string | null;
  category_ids:          string[];       // 1–15 category IDs, min 1 required
  sub_category_ids?:     string[];       // optional sub-category IDs
  size_ids?:             string[];       // pre-existing Size object IDs
  color_ids?:            string[];       // pre-existing Color object IDs
  tag_ids?:              string[];       // pre-existing Tag object IDs
  // Flags
  requires_measurement?: boolean;
  is_customisable?:      boolean;
  hot_deal?:             boolean;
  digital?:              boolean;
  featured?:             boolean;
  commission_rate?:      string;         // Decimal string
  status?:               ProductStatus;
  meta_title?:           string;
  meta_description?:     string;
  age_group?:            string;
  gender_target?:        string;
  idempotency_key?:      string;         // UUID v4
  variants?: Array<{
    size_id?:        string | null;
    color_id?:       string | null;
    price_override?: string | null;
    stock_qty?:      number;
    sku?:            string;
    is_active?:      boolean;
    weight_kg?:      string | null;
    barcode?:        string;
    is_default?:     boolean;
    dimensions_cm?:  Record<string, unknown> | null;
    notes?:          string;
  }>;
}

export type VendorProductUpdatePayload = Partial<VendorProductCreatePayload>;

// ── Orders ────────────────────────────────────────────────────────────────────
export interface VendorOrderItem {
  id:            number;
  product_title: string;
  product_pid:   string;
  qty:           number;
  price:         number;
  subtotal:      number;
}

export interface VendorOrder {
  id:              number;
  oid:             string;
  buyer_email:     string;
  buyer_full_name: string;
  order_status:    OrderStatus;
  payment_status:  PaymentStatus;
  total_price:     number;
  date:            string;
  items?:          VendorOrderItem[];
}

// ── Earnings ──────────────────────────────────────────────────────────────────
export interface VendorEarningItem {
  month:   string;
  revenue: number;
  orders:  number;
}

export interface VendorEarningTracker {
  total_revenue:    number;
  pending_revenue:  number;
  monthly_earnings: VendorEarningItem[];
}

// ── Analytics ─────────────────────────────────────────────────────────────────
export interface VendorAnalyticsSummary {
  total_revenue:   number;
  total_orders:    number;
  total_products:  number;
  avg_order_value: number;
  revenue_trend:   number;   // % change vs last period
  conversion_rate: number;
}

export interface VendorChartDataPoint {
  label: string;
  value: number;
}

export interface VendorTopCategory {
  category:     string;
  total_orders: number;
  revenue:      number;
}

export interface VendorPaymentDistribution {
  method:     string;
  count:      number;
  percentage: number;
}

// ── Reviews ───────────────────────────────────────────────────────────────────
export interface VendorReviewItem {
  id:            number;
  product_title: string;
  product_pid:   string;
  buyer_email:   string;
  rating:        number;
  review:        string;
  date:          string;
}

// ── Coupons (full list) ───────────────────────────────────────────────────────
export interface VendorCoupon {
  id:             string | number;
  code:           string;
  discount:       number;
  discount_type?: string;
  active:         boolean;
  valid_until?:   string;
}

// ── Mutation Payloads ─────────────────────────────────────────────────────────
export interface VendorSetupPayload {
  store_name:     string;
  description:    string;
  tagline?:       string;
  logo_url?:      string;
  cover_url?:     string;
  city:           string;
  state:          string;
  country?:       string;
  collection_ids: string[];
  instagram_url?: string;
  tiktok_url?:    string;
  twitter_url?:   string;
  website_url?:   string;
}

export interface VendorPayoutPayload {
  bank_name:               string;
  bank_code?:              string;
  account_name:            string;
  account_number:          string;  // full number for submission only (write-only)
  paystack_recipient_code?: string;
}

export interface VendorPinSetPayload {
  pin:         string;
  confirm_pin: string;
}

export interface VendorPinVerifyPayload {
  pin: string;
}

// ── Public Marketplace Types ───────────────────────────────────────────────────

/** Lightweight vendor card for the /vendors marketplace listing page. */
export interface PublicVendorCard {
  id:             string;
  store_name:     string;
  store_slug:     string;
  tagline:        string;
  description:    string;
  logo_url:       string;
  cover_url:      string;
  city:           string;
  state:          string;
  country:        string;
  is_verified:    boolean;
  is_featured:    boolean;
  average_rating: number;
  review_count:   number;
  total_products: number;
  total_sales:    number;
}

/** Full vendor profile for the /vendors/[slug] public detail page. */
export interface PublicVendorDetail extends PublicVendorCard {
  whatsapp:      string;
  instagram_url: string;
  tiktok_url:    string;
  twitter_url:   string;
  website_url:   string;
  collections:   Array<{ id: string; title: string; slug: string }>;
  products:      Array<{
    pid:       string;
    title:     string;
    price:     number;
    old_price: number | null;
    stock_qty: number;
  }>;
}

// ── Bank Account Payout Gate ───────────────────────────────────────────────────

/** Verification status of a saved bank account. */
export type BankAccountVerificationStatus = "pending" | "verified" | "failed";

/**
 * A saved vendor bank account.
 * Aligned with VendorBankAccount model (apps/vendor/models/vendor_bank_account.py).
 * account_number_enc is NEVER returned by the API — only masked_account / account_last4.
 */
export interface VendorBankAccount {
  id:                      string;
  bank_name:               string;
  bank_code:               string;
  account_name:            string;
  account_last4:           string;   // e.g. "1234" — safe to display
  masked_account:          string;   // e.g. "****1234"
  paystack_recipient_code: string;
  kyc_name_matched:        boolean;  // advisory: true if name matches KYC legal_name
  is_default:              boolean;
  verification_status:     BankAccountVerificationStatus;
  is_verified:             boolean;
  created_at:              string;   // ISO 8601
}

/**
 * Response from POST /api/v1/vendor/bank-accounts/resolve/
 * Returns the account holder name as resolved by Paystack.
 */
export interface BankAccountResolveResult {
  account_name:   string;
  account_number: string;   // echoed back for confirmation
}

/** Request body for POST /api/v1/vendor/bank-accounts/resolve/ */
export interface ResolveAccountPayload {
  account_number: string;   // 10 digits
  bank_code:      string;   // e.g. "044"
}

/**
 * Request body for POST /api/v1/vendor/bank-accounts/
 * account_name should be pre-filled from the resolve step.
 */
export interface CreateBankAccountPayload {
  account_number: string;   // 10 digits — write-only, encrypted on backend
  bank_code:      string;
  bank_name:      string;
  account_name:   string;   // as resolved by Paystack
}

/** Request body for POST /api/v1/vendor/payout/request/ */
export interface PayoutRequestPayload {
  bank_account_id: string;   // UUID of VendorBankAccount
  amount:          number;   // in NGN, minimum 1000
  narration?:      string;
}

/** Response from POST /api/v1/vendor/payout/request/ */
export interface PayoutRequestResult {
  status:        string;
  reference:     string;
  transfer_code: string;
  provider:      string;
  amount:        string;
  currency:      string;
  message:       string;
}
