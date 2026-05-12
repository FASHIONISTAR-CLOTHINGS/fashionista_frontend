/**
 * @file account.types.ts
 * @description Canonical TypeScript types for the unified Account domain.
 *
 * This domain aggregates four backend sub-domains into a single user-facing
 * account surface:
 *   1. ClientProfile  → /api/v1/ninja/client/profile/
 *   2. WalletBalance  → /api/v1/ninja/wallet/dashboard/
 *   3. OrderCounts    → /api/v1/ninja/orders/counts/
 *   4. Transactions   → /api/v1/ninja/transactions/recent/
 */

// ── Address ───────────────────────────────────────────────────────────────────

export interface AccountAddress {
  id: number;
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

// ── Client Profile ─────────────────────────────────────────────────────────────

export interface AccountProfile {
  id: number;
  user_id: string;
  user_email: string;
  bio: string | null;
  default_shipping_address: Record<string, unknown> | null;
  preferred_size: string | null;
  style_preferences: string[];
  favourite_colours: string[];
  country: string | null;
  state: string | null;
  is_profile_complete: boolean;
  total_orders: number;
  total_spent_ngn: string;
  email_notifications_enabled: boolean;
  sms_notifications_enabled: boolean;
  addresses: AccountAddress[];
}

// ── Wallet ─────────────────────────────────────────────────────────────────────

export interface AccountWalletBalance {
  /** Current available balance (money string e.g. "12500.00"). */
  balance: string;
  currency: string;
  /** Total held in pending escrow. */
  held_balance: string;
  /** Total inflow ever. */
  total_inflow: string;
  /** Total outflow ever. */
  total_outflow: string;
  /** Number of pending transactions. */
  pending_count: number;
}

// ── Order Counts ───────────────────────────────────────────────────────────────

/** Per-status order count dict, e.g. { "pending_payment": 2, "completed": 12 } */
export type AccountOrderCounts = Record<string, number>;

// ── Recent Transaction ─────────────────────────────────────────────────────────

export type TransactionKind = "credit" | "debit" | "reversal";
export type TransactionStatus = "pending" | "success" | "failed" | "reversed";

export interface AccountRecentTransaction {
  id: string;
  kind: TransactionKind;
  amount: string;
  currency: string;
  reference: string;
  description: string | null;
  status: TransactionStatus;
  created_at: string;
}

// ── Unified Account Dashboard ──────────────────────────────────────────────────

/**
 * Full account snapshot assembled on the client from 4 parallel Ninja reads.
 * Mirrors the `asyncio.gather()` bundle pattern used on the backend.
 */
export interface AccountDashboard {
  profile: AccountProfile;
  wallet: AccountWalletBalance;
  order_counts: AccountOrderCounts;
  recent_transactions: AccountRecentTransaction[];
}

// ── Mutation Inputs ────────────────────────────────────────────────────────────

export interface UpdateProfileInput {
  bio?: string;
  preferred_size?: string;
  style_preferences?: string[];
  favourite_colours?: string[];
  country?: string;
  state?: string;
  email_notifications_enabled?: boolean;
  sms_notifications_enabled?: boolean;
  default_shipping_address?: Record<string, unknown> | null;
}

export interface AddAddressInput {
  label: string;
  full_name: string;
  phone: string;
  street_address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  is_default?: boolean;
}
