/**
 * features/payment/components/PayoutDashboard.tsx
 *
 * Vendor Payout Management Dashboard.
 *
 * Features:
 *   - Payout history list with status badges and countdown to completion
 *   - Initiate payout form with amount + recipient code
 *   - Real-time balance awareness (wallet balance must cover payout)
 *   - KYC gate messaging when vendor not verified
 *
 * Routing: /vendor/payouts
 * Auth: Vendor-only (enforced by layout guard)
 */

"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePayoutHistory, useInitiateVendorPayout } from "../hooks/use-payout";
import {
  PAYOUT_STATUS_COLORS,
  PAYOUT_STATUS_LABELS,
} from "../types/payout.types";
import type { PayoutStatus, VendorPayout } from "../types/payout.types";

// ─────────────────────────────────────────────────────────────────────────────
// Form schema
// ─────────────────────────────────────────────────────────────────────────────

const PayoutFormSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .positive("Amount must be greater than 0")
    .max(10_000_000, "Maximum single payout is ₦10,000,000"),
  recipient_code: z
    .string()
    .min(5, "Enter a valid recipient code")
    .max(100),
  reason: z.string().max(200).optional(),
});

type PayoutFormValues = z.infer<typeof PayoutFormSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Status icon helper
// ─────────────────────────────────────────────────────────────────────────────

function StatusIcon({ status }: { status: PayoutStatus }) {
  switch (status) {
    case "success":    return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    case "failed":     return <XCircle      className="h-4 w-4 text-red-500" />;
    case "processing": return <Loader2      className="h-4 w-4 animate-spin text-blue-500" />;
    default:           return <Clock        className="h-4 w-4 text-slate-400" />;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Payout history row
// ─────────────────────────────────────────────────────────────────────────────

function PayoutRow({ payout }: { payout: VendorPayout }) {
  const amountNGN = Number(payout.amount).toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  });

  const date = new Date(payout.initiated_at).toLocaleDateString("en-NG", {
    day:   "numeric",
    month: "short",
    year:  "numeric",
  });

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <StatusIcon status={payout.status} />
          <span className="font-mono text-xs text-slate-500">
            {payout.reference}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 font-semibold text-slate-900">{amountNGN}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${PAYOUT_STATUS_COLORS[payout.status]}`}
        >
          {PAYOUT_STATUS_LABELS[payout.status]}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 capitalize">
        {payout.provider}
      </td>
      <td className="px-4 py-3 text-sm text-slate-500">
        {payout.bank_name}
        <span className="ml-1 font-mono text-xs text-slate-400">
          •••{payout.account_number.slice(-4)}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-slate-400">{date}</td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────────────────────────────────────

export function PayoutDashboard() {
  const [showForm, setShowForm] = useState(false);

  const {
    data: historyData,
    isLoading,
    isFetching,
    refetch,
  } = usePayoutHistory();

  const initiateMutation = useInitiateVendorPayout();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PayoutFormValues>({
    resolver: zodResolver(PayoutFormSchema),
  });

  const onSubmit = async (values: PayoutFormValues) => {
    await initiateMutation.mutateAsync({
      amount:         values.amount,
      recipient_code: values.recipient_code,
      reason:         values.reason,
    });
    reset();
    setShowForm(false);
  };

  const payouts = historyData?.payouts ?? [];
  const total   = historyData?.total   ?? 0;

  // Summary stats
  const successTotal = payouts
    .filter((p) => p.status === "success")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Vendor Payouts
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Withdraw your earnings to your registered bank account
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
          >
            <ArrowUpRight className="h-4 w-4" />
            {showForm ? "Cancel" : "Request Payout"}
          </button>
        </div>
      </div>

      {/* ── Summary cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Payouts</p>
          <p className="text-3xl font-bold text-slate-900">{total}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-sm text-emerald-700">Total Disbursed</p>
          <p className="text-2xl font-bold text-emerald-900">
            {successTotal.toLocaleString("en-NG", {
              style:    "currency",
              currency: "NGN",
              minimumFractionDigits: 0,
            })}
          </p>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <p className="text-sm text-blue-700">Processing</p>
          <p className="text-3xl font-bold text-blue-900">
            {payouts.filter((p) => p.status === "processing" || p.status === "pending").length}
          </p>
        </div>
      </div>

      {/* ── Payout initiation form ───────────────────────────────────────────── */}
      {showForm && (
        <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Banknote className="h-5 w-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-900">Initiate Payout</h3>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Amount */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Amount (₦)
              </label>
              <input
                type="number"
                step="0.01"
                {...register("amount", { valueAsNumber: true })}
                placeholder="e.g. 50000"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              />
              {errors.amount && (
                <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>
              )}
            </div>

            {/* Recipient code */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Recipient Code
              </label>
              <input
                type="text"
                {...register("recipient_code")}
                placeholder="RCP_xxxxxxxxxxxxxxxx"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              />
              {errors.recipient_code && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.recipient_code.message}
                </p>
              )}
            </div>

            {/* Reason (optional) */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Reason (optional)
              </label>
              <input
                type="text"
                {...register("reason")}
                placeholder="e.g. Weekly vendor disbursement"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              />
            </div>

            {/* Submit */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting || initiateMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
              >
                {(isSubmitting || initiateMutation.isPending) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Confirm Payout
              </button>
              <p className="text-xs text-slate-500">
                Your KYC must be approved. Funds deducted from wallet instantly.
              </p>
            </div>
          </form>
        </div>
      )}

      {/* ── Payout history table ─────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">
            Payout History
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            {total} total payouts · Auto-refreshes every 60s
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : payouts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-slate-400">
            <Banknote className="h-10 w-10 text-slate-300" />
            <p className="text-sm font-medium">No payouts yet</p>
            <p className="text-xs">Initiate your first payout to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {["Reference", "Amount", "Status", "Provider", "Account", "Date"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <PayoutRow key={p.id} payout={p} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
