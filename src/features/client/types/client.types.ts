// features/client/types/client.types.ts
// Aligned with: /api/v1/client/* backend contracts

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
  ai_recommendations: unknown[];
}

// ── Orders ────────────────────────────────────────────────────────────────────
export type OrderPaymentStatus = "paid" | "pending" | "failed";
export type OrderFulfillmentStatus = "Pending" | "Processing" | "Shipped" | "Fulfilled" | "Cancelled";

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
  id: number;
  oid: string;
  order_status: OrderFulfillmentStatus;
  payment_status: OrderPaymentStatus;
  total_price: number;
  date: string;
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
/** Minimal balance response from /api/v1/client/wallet/balance/ */
export interface WalletBalance {
  balance: string; // decimal string from backend
}

/**
 * Extended wallet dashboard type.
 * The frontend derives `total_amount_ngn`, `balance_ngn`, `transaction_count`
 * from the balance endpoint + transactions list for rendering wallet cards.
 */
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
