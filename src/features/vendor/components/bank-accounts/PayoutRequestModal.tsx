// features/vendor/components/bank-accounts/PayoutRequestModal.tsx
/**
 * PayoutRequestModal — Premium 2-step payout submission modal.
 *
 * UX Flow:
 *  Step 1 — Form:
 *    • Wallet balance display
 *    • Bank account selector (default pre-selected)
 *    • Amount input with quick-fill buttons (25%, 50%, Max)
 *    • Optional narration
 *    • "Request Payout" button → opens PinEntryModal
 *
 *  Step 2 — PIN Verification:
 *    • PinEntryModal (OPay-style 4-dot keypad)
 *    • Backend verifies PIN via POST /api/v1/vendor/pin/verify/
 *    • On success → immediately submits payout
 *    • On failure → shake animation, return to Step 2 (retry)
 *
 *  Step 3 — Success:
 *    • Payout reference with copy button
 *    • Estimated arrival (1–2 business days)
 *    • Done button closes modal
 *
 * Dynamic Limits:
 *  - Min/max withdrawal loaded from /api/v1/platform/settings/public/
 *  - Falls back to ₦1,000 min if backend unavailable
 */
"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  CheckCircle2,
  Copy,
  Loader2,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useBankAccounts,
  useRequestPayout,
  useWithdrawalLimits,
} from "@/features/vendor/hooks/use-bank-accounts";
import { PinEntryModal } from "./PinEntryModal";
import type { PayoutRequestResult } from "@/features/vendor/types/vendor.types";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PayoutRequestModalProps {
  open:           boolean;
  onOpenChange:   (open: boolean) => void;
  walletBalance?: number;
}

type Step = "form" | "pin" | "success";

// ── Component ─────────────────────────────────────────────────────────────────

export function PayoutRequestModal({
  open,
  onOpenChange,
  walletBalance = 0,
}: PayoutRequestModalProps) {
  const { data: accounts = [], isLoading: loadingAccounts } = useBankAccounts();
  const { minWithdrawal, maxWithdrawal } = useWithdrawalLimits();
  const payoutMutation = useRequestPayout();

  const [step,              setStep]              = useState<Step>("form");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [amount,            setAmount]            = useState("");
  const [narration,         setNarration]         = useState("Fashionistar Vendor Payout");
  const [result,            setResult]            = useState<PayoutRequestResult | null>(null);
  const [copied,            setCopied]            = useState(false);

  // ── Derived values
  const amountNum = parseFloat(amount) || 0;
  const effectiveMax = Math.min(walletBalance, maxWithdrawal);

  const amountError =
    amountNum > 0 && amountNum < minWithdrawal
      ? `Minimum payout is ₦${minWithdrawal.toLocaleString("en-NG")}`
      : amountNum > walletBalance
      ? "Amount exceeds your available balance"
      : amountNum > maxWithdrawal
      ? `Maximum payout is ₦${maxWithdrawal.toLocaleString("en-NG")}`
      : "";

  const canProceedToPin =
    !!selectedAccountId &&
    amountNum >= minWithdrawal &&
    amountNum <= effectiveMax &&
    !amountError;

  // ── Auto-select default account on open
  useEffect(() => {
    if (open && accounts.length > 0 && !selectedAccountId) {
      const defaultAccount = accounts.find((a) => a.is_default) ?? accounts[0];
      setSelectedAccountId(defaultAccount.id);
    }
  }, [open, accounts]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Reset everything on close
  useEffect(() => {
    if (!open) {
      setStep("form");
      setSelectedAccountId("");
      setAmount("");
      setNarration("Fashionistar Vendor Payout");
      setResult(null);
      setCopied(false);
      payoutMutation.reset();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── After PIN verified, submit payout
  function handlePinVerified() {
    payoutMutation.mutate(
      {
        bank_account_id: selectedAccountId,
        amount:          amountNum,
        narration:       narration || "Fashionistar Vendor Payout",
      },
      {
        onSuccess: (res) => {
          setResult(res);
          setStep("success");
        },
        onError: () => {
          // Return user to form so they can retry or change amount
          setStep("form");
        },
      }
    );
  }

  function handleCopyRef() {
    if (result?.reference) {
      navigator.clipboard.writeText(result.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (!open) return null;

  return (
    <>
      {/* ── Step 1: Form Modal ─────────────────────────────────────────────── */}
      {step !== "success" && (
        <div
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm",
            step === "pin" && "invisible",  // hide form behind PIN modal
          )}
        >
          <div
            className={cn(
              "max-w-md w-full rounded-2xl border border-slate-700 p-6 relative",
              "bg-gradient-to-b from-slate-900 to-slate-950",
              "shadow-2xl shadow-black/60",
            )}
            id="payout-request-modal"
          >
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white transition"
              aria-label="Close payout modal"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/20">
                  <ArrowUpRight className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-white text-lg font-semibold">Request Payout</h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Withdraw earnings to your bank account
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Wallet Balance Pill */}
              <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-600/10 to-teal-600/10 border border-emerald-500/20 p-3">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs text-slate-400">Available Balance</span>
                </div>
                <span className="text-sm font-bold text-emerald-400">
                  ₦{walletBalance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Bank Account Selector */}
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block" htmlFor="payout-bank-account-select">
                  Pay to
                </label>
                {loadingAccounts ? (
                  <div className="h-10 rounded-xl bg-slate-800/60 animate-pulse" />
                ) : (
                  <select
                    id="payout-bank-account-select"
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    disabled={payoutMutation.isPending}
                    className={cn(
                      "w-full h-10 rounded-xl bg-slate-800/60 border border-slate-700 text-white px-3 text-sm",
                      "outline-none focus:border-violet-500/50",
                      payoutMutation.isPending && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    <option value="" disabled className="bg-slate-900 text-slate-400">
                      Select bank account
                    </option>
                    {accounts.map((acct) => (
                      <option key={acct.id} value={acct.id} className="bg-slate-900 text-white">
                        {acct.bank_name} ({acct.masked_account}) — {acct.account_name}
                        {acct.is_default ? " ★" : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="payout-amount" className="text-xs text-slate-400 mb-1.5 block">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                    ₦
                  </span>
                  <input
                    id="payout-amount"
                    type="number"
                    min={minWithdrawal}
                    max={effectiveMax}
                    step="100"
                    placeholder={`${minWithdrawal.toLocaleString("en-NG")}`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={payoutMutation.isPending}
                    className={cn(
                      "w-full h-10 pl-8 pr-24 rounded-xl font-medium text-sm",
                      "bg-slate-800/60 border border-slate-700 text-white",
                      "outline-none placeholder:text-slate-600",
                      "focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20",
                      amountError && "border-red-500/50",
                    )}
                  />
                  {/* Quick-fill buttons */}
                  {walletBalance > 0 && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      {([0.25, 0.5, 1] as const).map((fraction) => {
                        const val = Math.floor(walletBalance * fraction / 100) * 100;
                        if (val < minWithdrawal) return null;
                        return (
                          <button
                            key={fraction}
                            type="button"
                            onClick={() => setAmount(String(val))}
                            className="px-1.5 py-0.5 rounded-md text-[10px] text-slate-400 hover:text-violet-300 hover:bg-violet-500/10 transition-colors"
                          >
                            {fraction === 1 ? "Max" : `${fraction * 100}%`}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {amountError && <p className="text-xs text-red-400 mt-1">{amountError}</p>}
                <p className="text-[11px] text-slate-500 mt-1">
                  Min: ₦{minWithdrawal.toLocaleString("en-NG")} · Max: ₦{maxWithdrawal.toLocaleString("en-NG")}
                </p>
              </div>

              {/* Narration */}
              <div>
                <label htmlFor="payout-narration" className="text-xs text-slate-400 mb-1.5 block">
                  Description <span className="text-slate-600">(optional)</span>
                </label>
                <textarea
                  id="payout-narration"
                  placeholder="Fashionistar Vendor Payout"
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  maxLength={255}
                  rows={2}
                  disabled={payoutMutation.isPending}
                  className={cn(
                    "w-full rounded-xl resize-none text-sm p-3",
                    "bg-slate-800/60 border border-slate-700 text-white",
                    "outline-none placeholder:text-slate-600",
                    "focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20",
                  )}
                />
              </div>

              {/* Error banner */}
              <AnimatePresence>
                {payoutMutation.isError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400"
                  >
                    {(payoutMutation.error as { response?: { data?: { error?: string } } })
                      ?.response?.data?.error ??
                      "Payout failed. Please try again or contact support."}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  disabled={payoutMutation.isPending}
                  className="flex-1 h-11 rounded-xl border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-medium transition disabled:opacity-50"
                  id="payout-cancel-button"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setStep("pin")}
                  disabled={!canProceedToPin || payoutMutation.isPending}
                  className={cn(
                    "flex-1 h-11 rounded-xl font-semibold text-sm",
                    "flex items-center justify-center gap-2",
                    "bg-gradient-to-r from-emerald-600 to-teal-600",
                    "hover:from-emerald-500 hover:to-teal-500 text-white",
                    "shadow-lg shadow-emerald-500/20",
                    "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none",
                    "transition-all",
                  )}
                  id="payout-submit-button"
                >
                  {payoutMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="h-4 w-4" />
                      Request Payout
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: PIN Verification ───────────────────────────────────────── */}
      <PinEntryModal
        open={step === "pin"}
        title="Confirm Payout"
        subtitle={`Authorise ₦${amountNum.toLocaleString("en-NG")} withdrawal`}
        onCancel={() => setStep("form")}
        onVerified={handlePinVerified}
        isSubmitting={payoutMutation.isPending}
      />

      {/* ── Step 3: Success State ──────────────────────────────────────────── */}
      {step === "success" && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "max-w-sm w-full rounded-2xl border border-slate-700 p-8",
              "bg-gradient-to-b from-slate-900 to-slate-950",
              "shadow-2xl shadow-black/60",
              "flex flex-col items-center text-center space-y-5",
            )}
          >
            {/* Success icon */}
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 border-2 border-emerald-500/30">
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            </div>

            <div>
              <p className="text-xl font-bold text-white">Payout Initiated! 🎉</p>
              <p className="text-sm text-slate-400 mt-1.5">
                ₦{parseFloat(result.amount).toLocaleString("en-NG")} will arrive within{" "}
                <span className="text-emerald-400 font-medium">1–2 business days</span>
              </p>
            </div>

            {/* Reference number */}
            <div className="w-full rounded-xl bg-slate-800/60 border border-slate-700/50 p-4">
              <p className="text-xs text-slate-400 mb-2">Reference Number</p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-mono text-violet-300 truncate flex-1 text-left">
                  {result.reference}
                </p>
                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="flex-shrink-0 text-slate-400 hover:text-violet-400 transition-colors p-1"
                  title="Copy reference"
                  aria-label="Copy reference number"
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-medium text-sm transition"
              id="payout-success-done-button"
            >
              Done
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
}
