/**
 * @file payment.api.ts
 * @description Payment API client for Paystack-backed payment flows.
 *
 * Endpoint Routing:
 *  - DRF sync  → /v1/payment/ (initialize, verify, bank list, transfer recipient)
 *  - Ninja async → /payments/ through apiAsync prefix /api/v1/ninja
 */
import { z } from "zod";
import { apiSync } from "@/core/api/client.sync";
import { apiAsync } from "@/core/api/client.async";
import { unwrapApiData } from "@/core/api/response";
import {
  BankOptionSchema,
  NinjaPaymentHistorySchema,
  PaymentDashboardSchema,
  PaymentIntentSchema,
  PaymentSummarySchema,
  parsePaymentResponse,
} from "../schemas/payment.schemas";
import type {
  BankOption,
  InitializePaymentInput,
  NinjaPaymentHistory,
  PaymentDashboard,
  PaymentIntent,
  PaymentSummary,
  TransferRecipientInput,
} from "../types/payment.types";

// ─── DRF Sync Endpoints ───────────────────────────────────────────────────────

export async function initializePayment(input: InitializePaymentInput): Promise<PaymentIntent> {
  const { data } = await apiSync.post<unknown>("/v1/payment/paystack/initialize/", input);
  return parsePaymentResponse(
    PaymentIntentSchema,
    unwrapApiData(data),
    "initializePayment",
  ) as PaymentIntent;
}

export async function verifyPayment(reference: string): Promise<PaymentIntent> {
  const { data } = await apiSync.get<unknown>(`/v1/payment/paystack/verify/${reference}/`);
  return parsePaymentResponse(
    PaymentIntentSchema,
    unwrapApiData(data),
    "verifyPayment",
  ) as PaymentIntent;
}

export async function fetchBanks(): Promise<BankOption[]> {
  const { data } = await apiSync.get<unknown>("/v1/payment/banks/");
  const payload = unwrapApiData<unknown>(data);
  const banks = Array.isArray(payload) ? payload : [];
  return parsePaymentResponse(z.array(BankOptionSchema), banks, "fetchBanks");
}

export async function createTransferRecipient(input: TransferRecipientInput): Promise<unknown> {
  const { data } = await apiSync.post<unknown>("/v1/payment/transfer-recipient/", input);
  return unwrapApiData(data);
}

// ─── Ninja Async Endpoints ────────────────────────────────────────────────────

/**
 * GET /api/v1/ninja/payments/dashboard/
 * Returns: PaymentDashboard (summary stats + 5 recent intents)
 * Delegates to PaymentIntent.aget_full_dashboard_data()
 */
export async function getNinjaPaymentDashboard(): Promise<PaymentDashboard> {
  const envelope = await apiAsync
    .get("payments/dashboard/")
    .json<{ status: string; data: unknown }>();
  return parsePaymentResponse(
    PaymentDashboardSchema,
    envelope?.data ?? envelope,
    "getNinjaPaymentDashboard",
  ) as PaymentDashboard;
}

/**
 * GET /api/v1/ninja/payments/summary/
 * Returns: PaymentSummary (total_count, pending_count, succeeded_total)
 */
export async function getNinjaPaymentSummary(): Promise<PaymentSummary> {
  const envelope = await apiAsync
    .get("payments/summary/")
    .json<{ status: string; data: unknown }>();
  return parsePaymentResponse(
    PaymentSummarySchema,
    envelope?.data ?? envelope,
    "getNinjaPaymentSummary",
  ) as PaymentSummary;
}

/**
 * GET /api/v1/ninja/payments/history/?limit=N
 * Returns: NinjaPaymentHistory (list of recent payment intents)
 */
export async function getNinjaPaymentHistory(limit = 10): Promise<NinjaPaymentHistory> {
  const envelope = await apiAsync
    .get(`payments/history/?limit=${limit}`)
    .json<{ status: string; data: unknown[]; count: number }>();
  return parsePaymentResponse(
    NinjaPaymentHistorySchema,
    { data: envelope?.data ?? [], count: envelope?.count ?? 0 },
    "getNinjaPaymentHistory",
  ) as NinjaPaymentHistory;
}
