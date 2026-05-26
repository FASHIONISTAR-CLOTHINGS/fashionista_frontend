// features/client/types/client.types.ts
// Aligned with: /api/v1/client/* (DRF sync) and /api/v1/ninja/client/* (Ninja async) backend contracts
// Updated: 2026-05-26 — Extended with CustomOrder milestone flow, rich dashboard analytics

// ── Address ───────────────────────────────────────────────────────────────────
export interface ClientAddress {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  street_address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  is_default: boolean;
  created_at?: string;
}

export interface ClientAddressCreatePayload {
  label: string;
  full_name: string;
  phone: string;
  street_address: string;
  city: string;
  state: string;
  country?: string;
  postal_code?: string;
  is_default?: boolean;
}

// ── Profile ───────────────────────────────────────────────────────────────────
export interface ClientProfile {
  id: string;
  user_id: string;
  user_email: string;
  bio: string;
  default_shipping_address: string;
  state: string;
  country: string;
  preferred_size: string;
  style_preferences: string[];
  favourite_colours: string[];
  total_orders: number;
  total_spent_ngn: number;
  is_profile_complete: boolean;
  email_notifications_enabled: boolean;
  sms_notifications_enabled: boolean;
  addresses: ClientAddress[];
}

export interface ClientProfileUpdatePayload {
  bio?: string;
  default_shipping_address?: string;
  state?: string;
  country?: string;
  preferred_size?: string;
  style_preferences?: string[];
  favourite_colours?: string[];
  email_notifications_enabled?: boolean;
  sms_notifications_enabled?: boolean;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export interface ClientDashboardAnalytics {
  total_orders: number;
  total_spent_ngn: number;
  saved_addresses: number;
  pending_orders: number;
  active_orders: number;
  completed_orders: number;
  wishlist_count: number;
}

export interface MeasurementSnapshot {
  id?: string;
  height_cm?: number;
  weight_kg?: number;
  chest_cm?: number;
  waist_cm?: number;
  hip_cm?: number;
  shoulder_cm?: number;
  arm_length_cm?: number;
  inseam_cm?: number;
  updated_at?: string;
}

export interface ClientDashboard {
  profile: {
    id: string;
    bio: string;
    preferred_size: string;
    style_preferences: string[];
    favourite_colours: string[];
    country: string;
    state: string;
    is_profile_complete: boolean;
  };
  analytics: ClientDashboardAnalytics;
  measurement_snapshot: MeasurementSnapshot;
  ai_recommendations: unknown[];
}

// ── Orders ────────────────────────────────────────────────────────────────────
export type OrderFulfillmentStatus =
  | "pending_payment"
  | "payment_confirmed"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "completed"
  | "cancelled"
  | "refunded"
  | "disputed";

export type OrderPaymentStatus = "paid" | "pending" | "failed" | "refunded";

export interface ClientOrderItem {
  id: number;
  product_title: string;
  product_pid: string;
  vendor_name: string;
  qty: number;
  price: number;
  subtotal: number;
  image?: string;
}

export interface ClientOrder {
  id: string;
  order_number: string;
  status: OrderFulfillmentStatus;
  total_amount: number;
  currency: string;
  fulfillment_type: string;
  vendor__store_name: string;
  tracking_number?: string;
  paid_at?: string;
  created_at: string;
  items?: ClientOrderItem[];
}

// ── Wishlist ──────────────────────────────────────────────────────────────────
export interface WishlistItem {
  id: number;
  product: {
    id: string;
    pid: string;
    title: string;
    price: number;
    old_price?: number;
    image?: string;
    vendor_name?: string;
    slug?: string;
  };
}

export type WishlistToggleAction = "added" | "removed";

export interface WishlistToggleResponse {
  status: string;
  message: string;
  action: WishlistToggleAction;
}

// ── Reviews ───────────────────────────────────────────────────────────────────
export interface ProductReview {
  id: number;
  user_email?: string;
  rating: number;
  review: string;
  date: string;
}

export interface ReviewCreatePayload {
  product_id: string;
  rating: number;
  review?: string;
}

// ── Wallet ────────────────────────────────────────────────────────────────────
export interface WalletBalance {
  balance: string; // decimal string from backend
}

export interface WalletDashboardData {
  balance_ngn: number;
  total_amount_ngn: number;
  transaction_count: number;
  transactions: import("@/features/account/components/Transactions").Transaction[];
}

export interface WalletTransferPayload {
  receiver_id: string;
  amount: string;
  transaction_password: string;
}

export interface WalletTransferResponse {
  status: string;
  message: string;
  data: {
    sender_balance: string;
    receiver_balance: string;
  };
}

export interface WalletTopUpPayload {
  amount: number;
  payment_method: "card" | "bank_transfer";
  callback_url?: string;
}

export interface WalletTopUpResponse {
  status: string;
  payment_url?: string;
  reference: string;
}

// ── Custom Orders (Bespoke / Made-to-Measure) ─────────────────────────────────
export type CustomOrderStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "in_production"
  | "completed"
  | "cancelled"
  | "disputed";

export type MilestonePaymentStatus = "pending" | "paid" | "failed" | "waived";

export type MilestonePct = 30 | 50 | 70 | 100;

export interface CustomOrderMilestone {
  id: string;
  milestone_pct: MilestonePct;
  amount_ngn: number;
  payment_status: MilestonePaymentStatus;
  paid_at?: string;
}

export interface CustomOrder {
  id: string;
  reference: string;
  status: CustomOrderStatus;
  design_brief: string;
  vendor_approval_note: string;
  budget_ngn: number;
  agreed_amount_ngn?: number;
  product_snapshot_id?: string;
  order_snapshot_id?: string;
  vendor_store_name: string;
  created_at: string;
  updated_at: string;
  milestones: CustomOrderMilestone[];
}

export interface CustomOrderCreatePayload {
  vendor_id: string;
  design_brief: string;
  budget_ngn: number;
  product_snapshot_id?: string;
  order_snapshot_id?: string;
  reference_images?: string[];
}

export interface CustomOrderApprovePayload {
  vendor_approval_note: string;
  agreed_amount_ngn: number;
}

export interface MilestonePayPayload {
  milestone_pct: MilestonePct;
  payment_method?: "wallet" | "card" | "bank_transfer";
}

// ── Reference Data ────────────────────────────────────────────────────────────
export interface Country {
  code: string;
  name: string;
  dial_code?: string;
  flag?: string;
}

// ── Support Tickets ───────────────────────────────────────────────────────────
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface SupportTicket {
  id: string;
  reference: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  created_at: string;
  updated_at: string;
  last_reply_at?: string;
}

export interface SupportTicketCreatePayload {
  subject: string;
  description: string;
  category: string;
  priority?: TicketPriority;
  attachment_urls?: string[];
}

// ── Notifications ─────────────────────────────────────────────────────────────
export type NotificationType =
  | "order_update"
  | "custom_order"
  | "payment"
  | "wallet"
  | "system"
  | "promo";

export interface ClientNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}
