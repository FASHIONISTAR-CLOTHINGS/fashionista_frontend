/**
 * @file wallet.types.ts
 * @description Wallet feature contracts shared by client and vendor dashboards.
 *
 * Versioning:
 *  - v1: DRF sync balance, PIN mutations
 *  - v2: Ninja async dashboard (WalletDashboardData, WalletHoldStats)
 */

export type WalletOwnerType =
  | "client"
  | "vendor"
  | "support"
  | "editor"
  | "moderator"
  | "admin"
  | "company";

export type WalletStatus = "active" | "inactive" | "frozen" | "suspended" | "closed";

// ─── DRF Sync Types ──────────────────────────────────────────────────────────

export interface WalletAccount {
  id: string;
  owner_type: WalletOwnerType;
  name: string;
  account_number: string;
  account_name: string;
  bank_name: string;
  provider: string;
  balance: string;
  available_balance: string;
  pending_balance: string;
  escrow_balance: string;
  status: WalletStatus;
  has_pin: boolean;
  currency: string | { code?: string; symbol?: string };
}

export interface PinPayload {
  pin: string;
}

export interface ChangePinPayload {
  current_pin: string;
  new_pin: string;
}

// ─── Ninja Async Dashboard Types ─────────────────────────────────────────────

export interface WalletHoldStats {
  active_holds_count: number;
  total_held_amount: string;
}

export interface WalletBalanceSnapshot {
  id?: string;
  name?: string;
  account_number?: string;
  account_name?: string;
  bank_name?: string;
  provider?: string;
  balance: string;
  available_balance: string;
  pending_balance: string;
  escrow_balance: string;
  status: WalletStatus;
  has_pin: boolean;
  currency_code: string;
  currency_symbol?: string;
}

export interface WalletDashboardData extends WalletBalanceSnapshot, WalletHoldStats {}

// ─── Withdrawal Types ─────────────────────────────────────────────────────────

/**
 * Body for POST /api/v1/wallet/withdraw/
 * KYC approval is enforced server-side before funds leave available balance.
 */
export interface WithdrawalInput {
  /** Amount in NGN (as string to preserve decimal precision) */
  amount: string;
  /** 4-digit wallet PIN */
  pin: string;
  bank_code: string;
  account_number: string;
  account_name: string;
}

/**
 * Response from POST /api/v1/wallet/withdraw/
 * Returns updated wallet balance + transaction reference.
 */
export interface WithdrawalResult {
  reference?: string;
  transaction_id?: string;
  amount: string;
  available_balance: string;
  pending_balance?: string;
  balance?: string;
  status?: string;
  message?: string;
}
