/**
 * features/payment/types/payout.types.ts
 *
 * Canonical TypeScript types for the vendor payout sub-domain.
 *
 * Mirrors: apps/payment/payout_service.py → VendorPayoutService
 *
 * Financial flows:
 *   Initiate: POST /v1/payment/vendor/payout/initiate/   (DRF sync — atomic)
 *   History:  GET  /ninja/payment/vendor/payouts/        (Ninja async — read)
 */

// ─────────────────────────────────────────────────────────────────────────────
// PAYOUT STATUS
// ─────────────────────────────────────────────────────────────────────────────

export type PayoutStatus =
  | "pending"
  | "processing"
  | "success"
  | "failed"
  | "reversed";

export const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
  pending:    "Pending",
  processing: "Processing",
  success:    "Completed",
  failed:     "Failed",
  reversed:   "Reversed",
};

export const PAYOUT_STATUS_COLORS: Record<PayoutStatus, string> = {
  pending:    "bg-slate-100 text-slate-700 border-slate-200",
  processing: "bg-blue-100  text-blue-800  border-blue-200",
  success:    "bg-emerald-100 text-emerald-800 border-emerald-200",
  failed:     "bg-red-100   text-red-800   border-red-200",
  reversed:   "bg-amber-100 text-amber-800 border-amber-200",
};

// ─────────────────────────────────────────────────────────────────────────────
// PAYOUT ENTITY
// ─────────────────────────────────────────────────────────────────────────────

/** Single payout record — mirrors Transaction ledger entry for payouts */
export interface VendorPayout {
  id:             string;   // UUID
  reference:      string;   // Platform reference (e.g. FSN-PAY-20260101-XXXX)
  transfer_code:  string;   // Provider transfer code (OlivePay/Paystack/Flutterwave)
  provider:       string;   // "olivepay" | "paystack" | "flutterwave"
  amount:         string;   // Decimal as string (e.g. "50000.00")
  currency:       string;   // "NGN"
  status:         PayoutStatus;
  recipient_code: string;
  bank_name:      string;
  account_number: string;
  initiated_at:   string;   // ISO 8601
  completed_at:   string | null;
  metadata:       Record<string, unknown>;
}

export interface VendorPayoutListEnvelope {
  total:   number;
  payouts: VendorPayout[];
}

// ─────────────────────────────────────────────────────────────────────────────
// API INPUT SHAPES
// ─────────────────────────────────────────────────────────────────────────────

/** POST /v1/payment/vendor/payout/initiate/ */
export interface PayoutInitiateInput {
  amount:         number;   // In kobo (integer) or naira (float) — backend normalises
  recipient_code: string;   // Transfer recipient code from provider
  reason?:        string;   // Optional narration
}

/** Query params for payout history */
export interface PayoutHistoryFilters {
  status?:    PayoutStatus;
  provider?:  string;
  page?:      number;
  page_size?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// QUERY KEY FACTORY
// ─────────────────────────────────────────────────────────────────────────────

export const payoutKeys = {
  all:     () => ["payout"] as const,
  history: (filters?: PayoutHistoryFilters) =>
    [...payoutKeys.all(), "history", filters ?? {}] as const,
} as const;
