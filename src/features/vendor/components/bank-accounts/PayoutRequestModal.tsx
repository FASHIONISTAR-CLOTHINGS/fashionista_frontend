// features/vendor/components/bank-accounts/PayoutRequestModal.tsx
/**
 * PayoutRequestModal — Premium payout submission modal.
 *
 * UX Flow:
 *  1. Vendor selects a saved bank account from a styled dropdown.
 *  2. Vendor enters amount (min ₦1,000).
 *  3. Optional narration textarea.
 *  4. "Request Payout" button → POST /api/v1/vendor/payout/request/.
 *  5. On success: toast + reference shown + modal closes.
 *
 * Features:
 *  - Wallet balance display with available balance check
 *  - Real-time amount validation (min ₦1,000, max = wallet balance)
 *  - Selected bank account card preview
 *  - Loading state with spinner
 *  - Success state with reference number
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  useBankAccounts,
  useRequestPayout,
} from "@/features/vendor/hooks/use-bank-accounts";
import type { PayoutRequestResult } from "@/features/vendor/types/vendor.types";

const MIN_PAYOUT = 1000;

interface PayoutRequestModalProps {
  open:           boolean;
  onOpenChange:   (open: boolean) => void;
  walletBalance?: number;  // current available NGN balance
}

export function PayoutRequestModal({
  open,
  onOpenChange,
  walletBalance = 0,
}: PayoutRequestModalProps) {
  const { data: accounts = [], isLoading: loadingAccounts } = useBankAccounts();
  const payoutMutation = useRequestPayout();

  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [amount,    setAmount]    = useState("");
  const [narration, setNarration] = useState("Fashionistar Vendor Payout");
  const [result,    setResult]    = useState<PayoutRequestResult | null>(null);
  const [copied,    setCopied]    = useState(false);


  const amountNum  = parseFloat(amount) || 0;
  const amountError =
    amountNum > 0 && amountNum < MIN_PAYOUT
      ? `Minimum payout is ₦${MIN_PAYOUT.toLocaleString()}`
      : amountNum > walletBalance
      ? "Amount exceeds your available balance"
      : "";
  const canSubmit =
    !!selectedAccountId &&
    amountNum >= MIN_PAYOUT &&
    amountNum <= walletBalance &&
    !payoutMutation.isPending;

  // Auto-select default account on open
  useEffect(() => {
    if (open && accounts.length > 0 && !selectedAccountId) {
      const defaultAccount = accounts.find((a) => a.is_default) ?? accounts[0];
      setSelectedAccountId(defaultAccount.id);
    }
  }, [open, accounts]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset on close
  useEffect(() => {
    if (!open) {
      setSelectedAccountId("");
      setAmount("");
      setNarration("Fashionistar Vendor Payout");
      setResult(null);
      setCopied(false);
      payoutMutation.reset();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSubmit() {
    if (!canSubmit) return;
    payoutMutation.mutate(
      {
        bank_account_id: selectedAccountId,
        amount:          amountNum,
        narration:       narration || "Fashionistar Vendor Payout",
      },
      {
        onSuccess: (res) => {
          setResult(res);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
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
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="pb-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/20">
              <ArrowUpRight className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-white text-lg font-semibold">
                Request Payout
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Withdraw earnings to your bank account
              </p>
            </div>
          </div>
        </div>

        {/* Success state */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center py-6 space-y-4"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 border-2 border-emerald-500/30">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">Payout Initiated! 🎉</p>
                <p className="text-sm text-slate-400 mt-1">
                  ₦{parseFloat(result.amount).toLocaleString()} will arrive within 1–2 business days
                </p>
              </div>
              <div className="w-full rounded-xl bg-slate-800/60 border border-slate-700/50 p-3">
                <p className="text-xs text-slate-400 mb-1.5">Reference Number</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-mono text-violet-300 truncate">
                    {result.reference}
                  </p>
                  <button
                    onClick={handleCopyRef}
                    className="flex-shrink-0 text-slate-400 hover:text-violet-400 transition-colors"
                    title="Copy reference"
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                onClick={() => onOpenChange(false)}
                className="w-full h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
              >
                Done
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form state */}
        {!result && (
          <div className="space-y-4">
            {/* Wallet Balance */}
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
              <Label className="text-xs text-slate-400 mb-1.5 block">
                Pay to
              </Label>
              {loadingAccounts ? (
                <div className="h-10 rounded-xl bg-slate-800/60 animate-pulse" />
              ) : (
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  disabled={payoutMutation.isPending}
                  className={cn(
                    "w-full h-10 rounded-xl bg-slate-800/60 border border-slate-700 text-white px-3 text-sm outline-none focus:border-violet-500/50",
                    payoutMutation.isPending && "opacity-50 cursor-not-allowed"
                  )}
                  id="payout-bank-account-select"
                >
                  <option value="" disabled className="bg-slate-900 text-slate-400">Select bank account</option>
                  {accounts.map((acct) => (
                    <option
                      key={acct.id}
                      value={acct.id}
                      className="bg-slate-900 text-white"
                    >
                      {acct.bank_name} ({acct.masked_account}) — {acct.account_name} {acct.is_default ? "★ Default" : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Amount */}
            <div>
              <Label htmlFor="payout-amount" className="text-xs text-slate-400 mb-1.5 block">
                Amount
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                  ₦
                </span>
                <Input
                  id="payout-amount"
                  type="number"
                  min={MIN_PAYOUT}
                  max={walletBalance}
                  step="100"
                  placeholder="1,000"
                  value={amount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                  disabled={payoutMutation.isPending}
                  className={cn(
                    "h-10 pl-8 rounded-xl font-medium",
                    "bg-slate-800/60 border-slate-700 text-white",
                    "placeholder:text-slate-600",
                    "focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50",
                    amountError && "border-red-500/50 focus-visible:ring-red-500/30",
                  )}
                />
                {/* Quick fill buttons */}
                {walletBalance > 0 && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    {[0.25, 0.5, 1].map((fraction) => {
                      const val = Math.floor(walletBalance * fraction / 100) * 100;
                      if (val < MIN_PAYOUT) return null;
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
              {amountError && (
                <p className="text-xs text-red-400 mt-1">{amountError}</p>
              )}
              <p className="text-[11px] text-slate-500 mt-1">
                Minimum payout: ₦{MIN_PAYOUT.toLocaleString()}
              </p>
            </div>

            {/* Narration */}
            <div>
              <Label htmlFor="payout-narration" className="text-xs text-slate-400 mb-1.5 block">
                Description <span className="text-slate-600">(optional)</span>
              </Label>
              <Textarea
                id="payout-narration"
                placeholder="Fashionistar Vendor Payout"
                value={narration}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNarration(e.target.value)}
                maxLength={255}
                rows={2}
                disabled={payoutMutation.isPending}
                className={cn(
                  "rounded-xl resize-none text-sm",
                  "bg-slate-800/60 border-slate-700 text-white",
                  "placeholder:text-slate-600",
                  "focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50",
                )}
              />
            </div>

            {/* Error */}
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
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={payoutMutation.isPending}
                className="flex-1 h-11 rounded-xl border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800"
                id="payout-cancel-button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={cn(
                  "flex-1 h-11 rounded-xl font-semibold",
                  "bg-gradient-to-r from-emerald-600 to-teal-600",
                  "hover:from-emerald-500 hover:to-teal-500 text-white",
                  "shadow-lg shadow-emerald-500/20",
                  "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none",
                )}
                id="payout-submit-button"
              >
                {payoutMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="h-4 w-4 mr-1.5" />
                    Request Payout
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
