/**
 * features/payment/api/payout.api.ts
 *
 * Dual-Engine API client for vendor payouts.
 *
 * Dual-Engine strategy:
 *   WRITE: POST /v1/payment/vendor/payout/initiate/  → apiSync (Axios/DRF)
 *          Atomic, wallet-debiting, ledger-recording, audit-logged.
 *
 *   READ:  GET  /ninja/payment/vendor/payouts/        → apiAsync (Ky/Ninja)
 *          Non-blocking payout history for vendor dashboard.
 */

import { apiSync } from "@/core/api/client.sync";
import { apiAsync } from "@/core/api/client.async";
import type {
  VendorPayout,
  VendorPayoutListEnvelope,
  PayoutInitiateInput,
  PayoutHistoryFilters,
} from "../types/payout.types";

// ── Initiate vendor payout (DRF sync — atomic) ────────────────────────────────

/**
 * Initiate a vendor payout.
 *
 * Backend flow (VendorPayoutService):
 *   1. KYC verification gate
 *   2. Wallet balance validation
 *   3. Provider transfer initiation (OlivePay/Paystack/Flutterwave)
 *   4. Wallet debit + TransactionLedger record (atomic DB transaction)
 *   5. AuditLog entry (FINANCIAL category — permanent retention)
 *
 * @param input PayoutInitiateInput (amount, recipient_code, optional reason)
 */
export async function initiateVendorPayout(
  input: PayoutInitiateInput
): Promise<VendorPayout> {
  const response = await apiSync.post<{ status?: string; data?: VendorPayout } & VendorPayout>(
    "v1/payment/vendor/payout/initiate/",
    input
  );
  const raw = response.data as unknown as { status?: string; data?: VendorPayout } & VendorPayout;
  return raw.data ?? (raw as unknown as VendorPayout);
}

// ── Payout history (Ninja async — non-blocking) ───────────────────────────────

/**
 * Fetch vendor payout history.
 *
 * Returns paginated list of payouts for the authenticated vendor.
 * Sourced from the TransactionLedger records created by VendorPayoutService.
 *
 * @param filters Optional status, provider, page filters
 */
export async function fetchPayoutHistory(
  filters?: PayoutHistoryFilters
): Promise<VendorPayoutListEnvelope> {
  const params: Record<string, string | number> = {};
  if (filters?.status)    params.status    = filters.status;
  if (filters?.provider)  params.provider  = filters.provider;
  if (filters?.page)      params.page      = filters.page;
  if (filters?.page_size) params.page_size = filters.page_size;

  return apiAsync
    .get("payment/vendor/payouts/", {
      searchParams: params as Record<string, string>,
    })
    .json<VendorPayoutListEnvelope>();
}
