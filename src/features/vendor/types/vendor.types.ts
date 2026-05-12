// features/vendor/types/vendor.types.ts
// Aligned with: /api/v1/vendor/* and /api/v1/ninja/vendor/*

export type VendorOnboardingStatus =
  | "not_started"
  | "draft"
  | "submitted"
  | "active"
  | "restricted";

export type ProductStatus = "published" | "draft" | "disabled" | "in-review";
export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Fulfilled" | "Cancelled";
export type VendorOrderStatus = OrderStatus;
export type PaymentStatus = "paid" | "pending" | "failed";

// ── Setup State ───────────────────────────────────────────────────────────────
export interface VendorSetupState {
  current_step: number;
  profile_complete: boolean;
  bank_details: boolean;
  id_verified: boolean;    // Future KYC — currently managed by staff
  first_product: boolean;
  onboarding_done: boolean;
  completion_percentage: number;
}

// ── Profile ───────────────────────────────────────────────────────────────────
export interface VendorProfile {
  id: string;
  user_id: string;
  user_email: string;
  store_name: string;
  store_slug: string;
  tagline: string;
  description: string;
  logo_url: string;
  cover_url: string;
  city: string;
  state: string;
  country: string;
  instagram_url: string;
  tiktok_url: string;
  twitter_url: string;
  website_url: string;
  whatsapp?: string;
  total_products: number;
  total_sales: number;
  total_revenue: number;
  average_rating: number;
  review_count: number;
  wallet_balance?: number;
  is_verified: boolean;
  is_active: boolean;
  is_featured: boolean;
  setup_state?: VendorSetupState;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export interface VendorDashboard {
  profile: Pick<VendorProfile,
    | "id" | "store_name" | "store_slug" | "tagline"
    | "logo_url" | "cover_url" | "city" | "state" | "country"
    | "is_verified" | "is_active" | "is_featured"
  >;
  analytics: {
    total_products: number;
    total_sales: number;
    total_revenue: number;
    average_rating: number;
    review_count: number;
  };
  setup_state: VendorSetupState;
  recent_activity: unknown[];
}

// ── Products ──────────────────────────────────────────────────────────────────
export interface VendorProductListItem {
  pid: string;
  title: string;
  price: number;
  stock_qty: number;
  status: ProductStatus;
  category__name?: string;
  date: string;
}

export interface VendorProductCreatePayload {
  title: string;
  description: string;
  price: number;
  old_price?: number;
  category: string;     // category id/slug
  tags?: string;
  stock_qty?: number;
  status?: ProductStatus;
  // nested (multipart keys built by FormData)
  specifications?: { title: string; content: string }[];
  colors?: { name: string; color_code: string; image?: string }[];
  sizes?: { name: string; price: number }[];
}

export type VendorProductUpdatePayload = Partial<VendorProductCreatePayload>;

// ── Orders ────────────────────────────────────────────────────────────────────
export interface VendorOrderItem {
  id: number;
  product_title: string;
  product_pid: string;
  qty: number;
  price: number;
  subtotal: number;
}

export interface VendorOrder {
  id: number;
  oid: string;
  buyer_email: string;
  buyer_full_name: string;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  total_price: number;
  date: string;
  items?: VendorOrderItem[];
}

// ── Earnings ──────────────────────────────────────────────────────────────────
export interface VendorEarningItem {
  month: string;
  revenue: number;
  orders: number;
}

export interface VendorEarningTracker {
  total_revenue: number;
  pending_revenue: number;
  monthly_earnings: VendorEarningItem[];
}

// ── Analytics ─────────────────────────────────────────────────────────────────
export interface VendorAnalyticsSummary {
  total_revenue: number;
  total_orders: number;
  total_products: number;
  avg_order_value: number;
  revenue_trend: number;   // % change vs last period
  conversion_rate: number;
}

export interface VendorChartDataPoint {
  label: string;
  value: number;
}

export interface VendorTopCategory {
  category: string;
  total_orders: number;
  revenue: number;
}

export interface VendorPaymentDistribution {
  method: string;
  count: number;
  percentage: number;
}

// ── Reviews ───────────────────────────────────────────────────────────────────
export interface VendorReviewItem {
  id: number;
  product_title: string;
  product_pid: string;
  buyer_email: string;
  rating: number;
  review: string;
  date: string;
}

// ── Coupons ───────────────────────────────────────────────────────────────────
export interface VendorCoupon {
  id: number;
  code: string;
  discount: number;
  active: boolean;
  valid_until?: string;
}

// ── Payouts ───────────────────────────────────────────────────────────────────
export interface VendorSetupPayload {
  store_name: string;
  description: string;
  tagline?: string;
  logo_url?: string;
  cover_url?: string;
  city: string;
  state: string;
  country?: string;
  instagram_url?: string;
  tiktok_url?: string;
  twitter_url?: string;
  website_url?: string;
}

export interface VendorPayoutPayload {
  bank_name: string;
  bank_code?: string;
  account_name: string;
  account_number: string;
  paystack_recipient_code?: string;
}

export interface VendorPinSetPayload {
  pin: string;
  confirm_pin: string;
}

export interface VendorPinVerifyPayload {
  pin: string;
}
