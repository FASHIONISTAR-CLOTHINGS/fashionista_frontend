/**
 * @file index.ts
 * @description Public API for the `features/payment` canonical FSD slice.
 *
 * Dual-Engine Strategy:
 *  - DRF (sync)   → /v1/payment/ (initialize, verify, banks, transfer recipient, payout initiate)
 *  - Ninja (async) → /ninja/payments/ (dashboard, summary, history, payout history)
 */

// ── Types ──────────────────────────────────────────────────────────────────
export type {
  PaymentIntent,
  PaymentSummary,
  PaymentDashboard,
  NinjaPaymentHistory,
  BankOption,
  InitializePaymentInput,
  TransferRecipientInput,
  WalletFundPaymentInput,
  WalletFundPaymentResponse,
  PaymentProvider,
  PaymentPurpose,
  OrderPaymentPath,
  CashPaymentMode,
} from "./types/payment.types";

// ── Schemas ────────────────────────────────────────────────────────────────
export {
  PaymentIntentSchema,
  PaymentSummarySchema,
  PaymentDashboardSchema,
  NinjaPaymentHistorySchema,
  BankOptionSchema,
  WalletFundPaymentResponseSchema,
  parsePaymentResponse,
} from "./schemas/payment.schemas";

// ── API ────────────────────────────────────────────────────────────────────
export {
  initializePayment,
  verifyPayment,
  fetchBanks,
  createTransferRecipient,
  fundWalletPayment,
  getNinjaPaymentDashboard,
  getNinjaPaymentSummary,
  getNinjaPaymentHistory,
} from "./api/payment.api";

// ── TanStack Query Hooks ───────────────────────────────────────────────────
export {
  paymentKeys,
  useInitializePayment,
  useFundWalletPayment,
  useVerifyPayment,
  useBanks,
  useCreateTransferRecipient,
  useNinjaPaymentDashboard,
  useNinjaPaymentSummary,
  useNinjaPaymentHistory,
} from "./hooks/use-payment";

// ── Components ─────────────────────────────────────────────────────────────
export { PaymentOverviewView } from "./components/PaymentOverviewView";

// ── Payout Types ─────────────────────────────────────────────────────────────
export type {
  PayoutStatus,
  VendorPayout,
  VendorPayoutListEnvelope,
  PayoutInitiateInput,
  PayoutHistoryFilters,
} from "./types/payout.types";

export {
  payoutKeys,
  PAYOUT_STATUS_LABELS,
  PAYOUT_STATUS_COLORS,
} from "./types/payout.types";

// ── Payout Schemas ────────────────────────────────────────────────────────────
export {
  PayoutStatusSchema,
  VendorPayoutSchema,
  VendorPayoutListEnvelopeSchema,
  PayoutInitiateResponseSchema,
  parsePayoutHistory,
  parsePayoutInitiateResponse,
} from "./schemas/payout.schemas";

// ── Payout API ────────────────────────────────────────────────────────────────
export { initiateVendorPayout, fetchPayoutHistory } from "./api/payout.api";

// ── Payout Hooks ──────────────────────────────────────────────────────────────
export { usePayoutHistory, useInitiateVendorPayout } from "./hooks/use-payout";

// ── Payout Components ─────────────────────────────────────────────────────────
export { PayoutDashboard } from "./components/PayoutDashboard";

// ── Admin Dashboard ────────────────────────────────────────────────────────────
export * from "./admin-dashboard";

