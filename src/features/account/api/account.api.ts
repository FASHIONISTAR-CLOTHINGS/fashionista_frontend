/**
 * @file account.api.ts
 * @description Account domain API client — Fashionistar frontend.
 *
 * Dual-Engine Strategy:
 *  - Ninja async (Ky) → ALL reads (profile, wallet balance, order counts, transactions)
 *  - DRF sync (Axios) → Profile mutations (update, add address)
 *
 * Endpoint Map:
 *  GET  /api/v1/ninja/client/profile/          → AccountProfile
 *  GET  /api/v1/ninja/wallet/dashboard/         → AccountWalletBalance
 *  GET  /api/v1/ninja/orders/counts/            → AccountOrderCounts
 *  GET  /api/v1/ninja/transactions/recent/      → AccountRecentTransaction[]
 *  PATCH /v1/client/profile/update/             → AccountProfile (DRF mutation)
 *  POST  /v1/client/addresses/                  → AccountAddress (DRF mutation)
 */
import { apiAsync } from "@/core/api/client.async";
import { apiSync } from "@/core/api/client.sync";
import { unwrapApiData } from "@/core/api/response";
import {
  parseAccountResponse,
  AccountProfileSchema,
  AccountWalletBalanceSchema,
  AccountOrderCountsSchema,
  AccountRecentTransactionsListSchema,
} from "../schemas/account.schemas";
import type {
  AccountProfile,
  AccountWalletBalance,
  AccountOrderCounts,
  AccountRecentTransaction,
  UpdateProfileInput,
  AddAddressInput,
  AccountAddress,
} from "../types/account.types";

// ── Ninja async reads ─────────────────────────────────────────────────────────

/**
 * GET /api/v1/ninja/client/profile/
 * Returns the complete client profile with addresses.
 * Ninja reads → high-concurrency ASGI worker, no sync_to_async.
 */
export async function fetchAccountProfile(): Promise<AccountProfile> {
  const raw = await apiAsync.get("client/profile/").json();
  return parseAccountResponse(
    AccountProfileSchema,
    unwrapApiData(raw),
    "fetchAccountProfile",
  ) as AccountProfile;
}

/**
 * GET /api/v1/ninja/wallet/dashboard/
 * Returns balance, held_balance, total_inflow, total_outflow, pending_count.
 * Single aget_full_dashboard_data() call on the backend — <5ms latency.
 */
export async function fetchAccountWalletBalance(): Promise<AccountWalletBalance> {
  const raw = await apiAsync.get("wallet/dashboard/").json();
  return parseAccountResponse(
    AccountWalletBalanceSchema,
    unwrapApiData(raw),
    "fetchAccountWalletBalance",
  ) as AccountWalletBalance;
}

/**
 * GET /api/v1/ninja/orders/counts/
 * Returns per-status order counts for navigation badges.
 * Backend: single GROUP BY aget_status_counts_for_user() → one DB round-trip.
 */
export async function fetchAccountOrderCounts(): Promise<AccountOrderCounts> {
  const envelope = await apiAsync
    .get("orders/counts/")
    .json<{ status: string; data: AccountOrderCounts }>();
  return parseAccountResponse(
    AccountOrderCountsSchema,
    envelope?.data ?? {},
    "fetchAccountOrderCounts",
  ) as AccountOrderCounts;
}

/**
 * GET /api/v1/ninja/transactions/recent/?limit=N
 * Returns the N most recent transactions for the account dashboard widget.
 */
export async function fetchAccountRecentTransactions(
  limit = 10,
): Promise<AccountRecentTransaction[]> {
  const envelope = await apiAsync
    .get(`transactions/recent/`, { searchParams: { limit } })
    .json<{ status: string; data: unknown[]; count: number }>();
  const parsed = parseAccountResponse(
    AccountRecentTransactionsListSchema,
    { count: envelope?.count ?? 0, data: envelope?.data ?? [] },
    "fetchAccountRecentTransactions",
  );
  return (parsed.data ?? []) as AccountRecentTransaction[];
}

// ── DRF sync mutations ────────────────────────────────────────────────────────

/**
 * PATCH /v1/client/profile/update/
 * Partial update — only send changed fields.
 */
export async function updateAccountProfile(
  input: UpdateProfileInput,
): Promise<AccountProfile> {
  const { data } = await apiSync.patch<unknown>("/v1/client/profile/update/", input);
  return parseAccountResponse(
    AccountProfileSchema,
    unwrapApiData(data),
    "updateAccountProfile",
  ) as AccountProfile;
}

/**
 * POST /v1/client/addresses/
 * Add a new shipping address to the client profile.
 */
export async function addAccountAddress(
  input: AddAddressInput,
): Promise<AccountAddress> {
  const { data } = await apiSync.post<unknown>("/v1/client/addresses/", input);
  return unwrapApiData<AccountAddress>(data);
}

/**
 * PATCH /v1/client/addresses/{id}/
 * Update an existing shipping address.
 */
export async function updateAccountAddress(
  id: number,
  input: Partial<AddAddressInput>,
): Promise<AccountAddress> {
  const { data } = await apiSync.patch<unknown>(
    `/v1/client/addresses/${id}/`,
    input,
  );
  return unwrapApiData<AccountAddress>(data);
}

/**
 * DELETE /v1/client/addresses/{id}/
 * Remove a shipping address.
 */
export async function deleteAccountAddress(id: number): Promise<void> {
  await apiSync.delete(`/v1/client/addresses/${id}/`);
}

/**
 * POST /v1/client/addresses/{id}/set-default/
 * Mark an address as the default shipping destination.
 */
export async function setDefaultAddress(id: number): Promise<AccountAddress> {
  const { data } = await apiSync.post<unknown>(
    `/v1/client/addresses/${id}/set-default/`,
  );
  return unwrapApiData<AccountAddress>(data);
}
