/**
 * @file wallet.api.ts
 * @description Wallet API client.
 *
 * Endpoint Routing:
 *  - DRF sync  → /v1/wallet/  (reads + PIN writes, CustomJSONRenderer)
 *  - Ninja async → /wallet/ through apiAsync prefix /api/v1/ninja
 */
import { apiSync } from "@/core/api/client.sync";
import { apiAsync } from "@/core/api/client.async";
import { unwrapApiData } from "@/core/api/response";
import {
  WalletDashboardSchema,
  WalletSchema,
  parseWalletResponse,
} from "../schemas/wallet.schemas";
import type {
  ChangePinPayload,
  PinPayload,
  WalletAccount,
  WalletDashboardData,
  WithdrawalInput,
  WithdrawalResult,
} from "../types/wallet.types";

// ─── DRF Sync Endpoints ───────────────────────────────────────────────────────

export async function fetchWallet(): Promise<WalletAccount> {
  const { data } = await apiSync.get<unknown>("v1/wallet/me/");
  return parseWalletResponse(
    WalletSchema,
    unwrapApiData(data),
    "fetchWallet",
  ) as WalletAccount;
}

export async function setWalletPin(payload: PinPayload): Promise<WalletAccount> {
  const { data } = await apiSync.post<unknown>("v1/wallet/pin/set/", payload);
  return parseWalletResponse(
    WalletSchema,
    unwrapApiData(data),
    "setWalletPin",
  ) as WalletAccount;
}

export async function verifyWalletPin(payload: PinPayload): Promise<{ valid: boolean }> {
  const { data } = await apiSync.post<unknown>("v1/wallet/pin/verify/", payload);
  return unwrapApiData<{ valid: boolean }>(data);
}

export async function changeWalletPin(payload: ChangePinPayload): Promise<WalletAccount> {
  const { data } = await apiSync.post<unknown>("v1/wallet/pin/change/", payload);
  return parseWalletResponse(
    WalletSchema,
    unwrapApiData(data),
    "changeWalletPin",
  ) as WalletAccount;
}

// ─── Ninja Async Endpoints ────────────────────────────────────────────────────

/**
 * GET /api/v1/ninja/wallet/dashboard/
 * Returns: WalletDashboardData (balance + hold stats) from Wallet.aget_full_dashboard_data()
 */
export async function getNinjaWalletDashboard(): Promise<WalletDashboardData> {
  const envelope = await apiAsync
    .get("wallet/dashboard/")
    .json<{ status?: string; data?: unknown } | unknown>();
  return parseWalletResponse(
    WalletDashboardSchema,
    unwrapApiData(envelope),
    "getNinjaWalletDashboard",
  ) as WalletDashboardData;
}

/**
 * POST /api/v1/wallet/withdraw/
 *
 * Initiate a withdrawal from the authenticated user's wallet.
 * Server enforces:
 *   - PIN verification
 *   - KYC approval gate (assert_kyc_approved)
 *   - Sufficient available_balance check
 *   - Idempotency via reference tracking
 *
 * On KYC failure, the backend returns HTTP 403 with:
 *   { detail: "KYC not approved. Complete identity verification before withdrawing." }
 */
export async function initiateWithdrawal(
  payload: WithdrawalInput,
): Promise<WithdrawalResult> {
  const { data } = await apiSync.post<unknown>("v1/wallet/withdraw/", payload);
  return unwrapApiData<WithdrawalResult>(data);
}
