"use client";

/**
 * features/admin-dashboard/wallet/components/CompanyWithdrawalPanel.tsx
 *
 * Company Commission Payout Panel — Fashionistar Financial Dashboard.
 *
 * Security Features:
 *   - Real-time "FASHIONISTAR" keyword validation on account name field.
 *   - Submit button disabled until keyword is present (Door 2 pre-check).
 *   - All form submission errors from backend security gates are surfaced.
 *   - Visual security indicators (green/red borders, lock icon states).
 *
 * Integration:
 *   - Calls POST /ninja/wallet/company/payout/ via initiateCompanyWithdrawal().
 *   - Invalidates company wallet balance query on success.
 *   - Uses TanStack Query mutation for loading/error state management.
 *
 * Usage:
 *   <CompanyWithdrawalPanel onSuccess={() => refetchBalance()} />
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShieldCheck,
  ShieldAlert,
  Banknote,
  AlertOctagon,
  CheckCircle2,
  Loader2,
  Lock,
  Building2,
} from "lucide-react";
import { initiateCompanyWithdrawal } from "../api/admin-wallet.api";
import type { CompanyPayoutRequest } from "../api/admin-wallet.api";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CompanyWithdrawalFormData {
  amount: string;
  bank_code: string;
  account_number: string;
  account_name: string;
  bank_name: string;
}

interface CompanyWithdrawalPanelProps {
  availableBalance?: string;
  onSuccess?: () => void;
}

// ── Helper: Format NGN currency ───────────────────────────────────────────────

function formatNGN(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "₦0.00";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(num);
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CompanyWithdrawalPanel({
  availableBalance = "0.00",
  onSuccess,
}: CompanyWithdrawalPanelProps) {
  const queryClient = useQueryClient();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CompanyWithdrawalFormData>({
    mode: "onChange",
  });

  // Real-time account name keyword validation (mirrors backend Door 2)
  const accountName = watch("account_name", "");
  const hasFashionistarKeyword = accountName
    .trim()
    .toUpperCase()
    .includes("FASHIONISTAR");

  const amount = watch("amount", "");
  const amountNum = parseFloat(amount || "0");
  const isAmountValid = amountNum > 0 && amountNum <= parseFloat(availableBalance || "0");

  // ── Mutation ─────────────────────────────────────────────────────────────

  const mutation = useMutation({
    mutationFn: (data: CompanyPayoutRequest) => initiateCompanyWithdrawal(data),
    onSuccess: (result) => {
      setSubmitted(true);
      toast.success(
        `Commission payout initiated! Reference: ${result.reference}`,
        { duration: 8000 }
      );
      queryClient.invalidateQueries({ queryKey: ["company-wallet-balance"] });
      reset();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Payout request failed. Please try again.", {
        duration: 6000,
      });
    },
  });

  // ── Form Submit ───────────────────────────────────────────────────────────

  const onSubmit = (data: CompanyWithdrawalFormData) => {
    if (!hasFashionistarKeyword) {
      toast.error(
        "Security Gate: Account name MUST contain the keyword 'FASHIONISTAR'."
      );
      return;
    }

    mutation.mutate({
      amount: parseFloat(data.amount),
      bank_code: data.bank_code,
      account_number: data.account_number,
      account_name: data.account_name,
      idempotency_key: `company-payout-${Date.now()}`,
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-200/60 bg-white shadow-2xl">
      {/* Security stripe — indicates this is a protected area */}
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

      {/* Header */}
      <div className="flex items-start gap-4 border-b border-zinc-100 px-8 py-6">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
            hasFashionistarKeyword && accountName
              ? "bg-emerald-50"
              : "bg-zinc-100"
          } transition-colors duration-300`}
        >
          {hasFashionistarKeyword && accountName ? (
            <ShieldCheck className="h-7 w-7 text-emerald-600" />
          ) : (
            <ShieldAlert className="h-7 w-7 text-zinc-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
            Company Commission Payout
          </h2>
          <p className="mt-0.5 text-sm text-zinc-500">
            Restricted to{" "}
            <span className="font-mono text-xs font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
              fashionistarclothings@outlook.com
            </span>
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5">
          <Lock className="h-3.5 w-3.5 text-zinc-500" />
          <span className="text-xs font-semibold text-zinc-600">
            Double-Door Secured
          </span>
        </div>
      </div>

      {/* Available Balance Display */}
      <div className="mx-8 mt-6 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-teal-200 uppercase tracking-wider">
              Available Commission Balance
            </p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight">
              {formatNGN(availableBalance)}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
            <Building2 className="h-6 w-6" />
          </div>
        </div>
        <p className="mt-3 text-xs text-teal-200">
          Fashionistar Company Wallet · Commission Account
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-8 py-6">
        {/* Amount */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
            Withdrawal Amount (NGN)
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-zinc-400">
              ₦
            </span>
            <input
              {...register("amount", {
                required: "Amount is required",
                min: { value: 1, message: "Amount must be greater than zero" },
                validate: (v) =>
                  parseFloat(v) <= parseFloat(availableBalance) ||
                  `Cannot exceed available balance of ${formatNGN(availableBalance)}`,
              })}
              type="number"
              step="0.01"
              placeholder="0.00"
              className={`w-full rounded-xl border-2 py-4 pl-10 pr-4 text-xl font-bold outline-none transition-all duration-200 ${
                errors.amount
                  ? "border-red-300 bg-red-50/30 text-red-900"
                  : isAmountValid
                  ? "border-emerald-300 bg-emerald-50/30 text-zinc-900"
                  : "border-zinc-200 bg-zinc-50 text-zinc-900 focus:border-teal-400"
              }`}
            />
          </div>
          {errors.amount && (
            <p className="flex items-center gap-1 text-xs font-medium text-red-600">
              <AlertOctagon className="h-3.5 w-3.5" />
              {errors.amount.message}
            </p>
          )}
        </div>

        {/* Account Name — Door 2 field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
            Destination Account Name{" "}
            <span className="font-normal text-red-500">
              (must contain "FASHIONISTAR")
            </span>
          </label>
          <div className="relative">
            <input
              {...register("account_name", {
                required: "Account name is required",
                validate: (v) =>
                  v.toUpperCase().includes("FASHIONISTAR") ||
                  "Account name MUST contain the keyword 'FASHIONISTAR'",
              })}
              type="text"
              placeholder="e.g. FASHIONISTAR CLOTHINGS LTD"
              className={`w-full rounded-xl border-2 py-3 px-4 text-base font-semibold outline-none transition-all duration-200 ${
                !accountName
                  ? "border-zinc-200 bg-zinc-50 text-zinc-900 focus:border-teal-400"
                  : hasFashionistarKeyword
                  ? "border-emerald-400 bg-emerald-50/40 text-emerald-900"
                  : "border-red-400 bg-red-50/40 text-red-900"
              }`}
            />
            {accountName && (
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                {hasFashionistarKeyword ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <AlertOctagon className="h-5 w-5 text-red-500" />
                )}
              </div>
            )}
          </div>

          {/* Door 2 status message */}
          {accountName && !hasFashionistarKeyword && (
            <p className="flex items-center gap-1 text-xs font-semibold text-red-600">
              <AlertOctagon className="h-3.5 w-3.5" />
              Security Door 2: Keyword &ldquo;FASHIONISTAR&rdquo; not found in account name.
            </p>
          )}
          {hasFashionistarKeyword && (
            <p className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Security Door 2: Keyword verified ✓
            </p>
          )}
        </div>

        {/* Bank Code */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
              Bank Code
            </label>
            <input
              {...register("bank_code", { required: "Bank code is required" })}
              type="text"
              placeholder="e.g. 044"
              maxLength={10}
              className={`w-full rounded-xl border-2 py-3 px-4 text-base font-mono outline-none transition-all focus:border-teal-400 ${
                errors.bank_code
                  ? "border-red-300 bg-red-50/30"
                  : "border-zinc-200 bg-zinc-50"
              }`}
            />
            {errors.bank_code && (
              <p className="text-xs text-red-500">{errors.bank_code.message}</p>
            )}
          </div>

          {/* Account Number */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
              Account Number (NUBAN)
            </label>
            <input
              {...register("account_number", {
                required: "Account number is required",
                pattern: {
                  value: /^\d{10}$/,
                  message: "Must be 10 digits",
                },
              })}
              type="text"
              placeholder="0123456789"
              maxLength={10}
              className={`w-full rounded-xl border-2 py-3 px-4 text-base font-mono outline-none transition-all focus:border-teal-400 ${
                errors.account_number
                  ? "border-red-300 bg-red-50/30"
                  : "border-zinc-200 bg-zinc-50"
              }`}
            />
            {errors.account_number && (
              <p className="text-xs text-red-500">
                {errors.account_number.message}
              </p>
            )}
          </div>
        </div>

        {/* Bank Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
            Bank Name <span className="font-normal text-zinc-400">(optional)</span>
          </label>
          <input
            {...register("bank_name")}
            type="text"
            placeholder="e.g. Access Bank"
            className="w-full rounded-xl border-2 border-zinc-200 bg-zinc-50 py-3 px-4 text-base outline-none transition-all focus:border-teal-400"
          />
        </div>

        {/* Security Status Summary */}
        <div
          className={`rounded-2xl border-2 p-4 transition-all duration-300 ${
            hasFashionistarKeyword
              ? "border-emerald-200 bg-emerald-50/60"
              : "border-zinc-200 bg-zinc-50"
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
            Security Verification Status
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs text-zinc-700">
                Door 1: Identity — Company Admin authenticated
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`h-4 w-4 rounded-full flex items-center justify-center transition-colors ${
                  hasFashionistarKeyword ? "bg-emerald-500" : "bg-zinc-300"
                }`}
              >
                {hasFashionistarKeyword ? (
                  <CheckCircle2 className="h-3 w-3 text-white" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-white" />
                )}
              </div>
              <span className="text-xs text-zinc-700">
                Door 2: Domain — &ldquo;FASHIONISTAR&rdquo; keyword{" "}
                {hasFashionistarKeyword ? (
                  <span className="font-semibold text-emerald-700">verified ✓</span>
                ) : (
                  <span className="text-zinc-400">pending…</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={
            mutation.isPending ||
            !hasFashionistarKeyword ||
            !isAmountValid
          }
          className={`flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-base font-bold tracking-wide transition-all duration-200 ${
            mutation.isPending || !hasFashionistarKeyword || !isAmountValid
              ? "cursor-not-allowed bg-zinc-200 text-zinc-400"
              : "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-200 hover:from-teal-700 hover:to-emerald-700 hover:shadow-xl active:scale-[0.99]"
          }`}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Verifying Security Doors &amp; Processing…
            </>
          ) : (
            <>
              <Banknote className="h-5 w-5" />
              Request Commission Payout
            </>
          )}
        </button>

        {/* Success state */}
        {submitted && mutation.isSuccess && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
            <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-600" />
            <p className="font-bold text-emerald-800">
              Commission Payout Initiated
            </p>
            <p className="mt-1 text-xs text-emerald-600">
              Your request is pending provider execution. You will be notified
              once the transfer is confirmed.
            </p>
          </div>
        )}
      </form>
    </div>
  );
}