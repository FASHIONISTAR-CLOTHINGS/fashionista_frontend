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

export type ProductStatus   = "published" | "draft" | "disabled" | "in-review";
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
  reviews: VendorReviewItem[];
  /**
   * Note: This is coupon STATS (active/inactive count), not the full coupon list.
   * Use vendorApi.getCoupons() for the paginated list.
   */
  coupons:         VendorCouponStats;
  wallet:          VendorWallet | null;
  recent_activity: Array<{
    type?:  string;
    label?: string;
    date?:  string;
    [key: string]: unknown;
  }>;
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

export interface VendorProductCreatePayload {
  title:         string;
  description:   string;
  price:         number;
  old_price?:    number;
  category:      string;
  tags?:         string;
  stock_qty?:    number;
  status?:       ProductStatus;
  // nested (multipart keys built by FormData)
  specifications?: { title: string; content: string }[];
  colors?:         { name: string; color_code: string; image?: string }[];
  sizes?:          { name: string; price: number }[];
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
  id:           number;
  code:         string;
  discount:     number;
  active:       boolean;
  valid_until?: string;
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
