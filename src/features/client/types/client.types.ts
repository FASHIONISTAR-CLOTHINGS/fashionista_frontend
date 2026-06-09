// features/client/types/client.types.ts
// Aligned with: /api/v1/client/* (DRF sync) and /api/v1/ninja/client/* (Ninja async) backend contracts
// Updated: 2026-05-26 — Full schema alignment pass: WalletBalance, SupportTicket, TicketStatus, CustomOrder

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
  last_active_at?: string | null;
  phone_verified: boolean;
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
    last_active_at?: string | null;
    phone_verified: boolean;
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
/**
 * Matches Wallet.get_balance_snapshot() / aget_balance_snapshot() output.
 * Backend: apps/wallet/models.py → WalletStatus choices: active | inactive | frozen | suspended | closed
 */
export interface WalletBalance {
  /** UUID of the Wallet row */
  id?: string;
  name?: string;
  account_number?: string;
  account_name?: string;
  bank_name?: string;
  provider?: string;
  /** Ledger balance — all confirmed credits minus all confirmed debits */
  balance: string;
  /** Immediately spendable (balance minus escrow/pending) */
  available_balance: string;
  /** Awaiting settlement */
  pending_balance: string;
  /** Locked in escrow for active orders */
  escrow_balance: string;
  /** One of: active | inactive | frozen | suspended | closed */
  status: "active" | "inactive" | "frozen" | "suspended" | "closed";
  /** True when wallet.pin_hash is non-empty */
  has_pin: boolean;
  currency_code: string;
  currency_symbol?: string;
  /** From WalletHold aggregation */
  active_holds_count?: number;
  total_held_amount?: string;
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

export interface WalletWithdrawalPayload {
  amount: number;
  pin: string;
  bank_code: string;
  account_number: string;
  account_name: string;
}

export interface WalletWithdrawalResponse {
  transaction_id: string;
  reference: string;
  status: string;
  amount: string;
  available_balance: string;
  pending_balance: string;
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
/**
 * Matches backend TicketStatus TextChoices exactly:
 *   open | awaiting_client | awaiting_vendor | in_review | resolved | closed
 */
export type TicketStatus =
  | "open"
  | "awaiting_client"
  | "awaiting_vendor"
  | "in_review"
  | "resolved"
  | "closed";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

/**
 * Matches TicketCategory TextChoices from backend support_ticket.py
 */
export type TicketCategory =
  | "order_dispute"
  | "payment_issue"
  | "product_complaint"
  | "vendor_conduct"
  | "delivery_problem"
  | "refund_request"
  | "measurement_issue"
  | "general";

export interface TicketMessage {
  id: string;
  author_name: string;
  body: string;
  is_staff_reply: boolean;
  attachments: string[];
  created_at: string;
}

export interface SupportTicket {
  id: string;
  /** Backend field name is `title` — matches SupportTicketWriteSerializer.title and SupportTicket model */
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  order_id?: string | null;
  submitter_email?: string | null;
  assigned_to_name?: string | null;
  resolution_notes?: string;
  resolved_at?: string | null;
  closed_at?: string | null;
  messages?: TicketMessage[];
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketCreatePayload {
  /** Backend field: `title` (min 5, max 300 chars per SupportTicketWriteSerializer) */
  title: string;
  description: string;
  category: TicketCategory;
  priority?: TicketPriority;
  order_id?: string;
  metadata?: Record<string, unknown>;
}

export interface TicketMessageCreatePayload {
  body: string;
  attachments?: string[];
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
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}
