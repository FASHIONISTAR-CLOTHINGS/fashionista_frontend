"use client";

/**
 * @file WithdrawalPanel.tsx
 * @description Withdrawal panel with KYC enforcement gate.
 *
 * Architecture:
 *  1. Reads KYC status from Ninja (GET /ninja/kyc/status/)
 *  2. Reads wallet balance from Ninja (GET /ninja/wallet/dashboard/)
 *  3. If KYC not approved → renders KYC blocker UI (no form shown)
 *  4. If KYC approved → renders withdrawal form:
 *       - Amount (validates against available_balance)
 *       - 4-digit PIN
 *       - Optional bank routing fields
 *     → POST /api/v1/wallet/withdraw/
 *     → Server re-validates KYC gate + PIN + balance
 *
 * Server enforces: KYC check, PIN verification, balance sufficiency.
 * Frontend enforces: KYC status display, client-side form validation.
 *
 * This is the SINGLE canonical withdrawal UI — do not duplicate.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  Banknote,
  Lock,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useNinjaKycStatus } from "@/features/kyc";
import { useInitiateWithdrawal, useWalletDashboard } from "../hooks/use-wallet";
import type { WithdrawalInput } from "../types/wallet.types";

// ── KYC Status Display Helper ─────────────────────────────────────────────────

const KYC_STATUS_LABELS: Record<string, string> = {
  not_started: "Not Started",
  pending: "Pending Review",
  in_review: "Under Review",
  rejected: "Rejected",
  resubmit: "Resubmission Required",
};

// ── Main Component ────────────────────────────────────────────────────────────

type WithdrawalPanelProps = {
  audience?: "client" | "vendor";
};

export function WithdrawalPanel({ audience = "client" }: WithdrawalPanelProps) {
  const router = useRouter();

  // ── Remote state ──────────────────────────────────────────────────────────
  const {
    data: kycData,
    isLoading: kycLoading,
  } = useNinjaKycStatus();

  const {
    data: walletData,
    isLoading: walletLoading,
  } = useWalletDashboard();

  const withdraw = useInitiateWithdrawal();

  // ── Local form state ──────────────────────────────────────────────────────
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bankCode, setBankCode] = useState("");

  const isKycApproved = kycData?.is_approved === true;
  const kycStatus = kycData?.status ?? "not_started";
  const kycHref = audience === "vendor" ? "/vendor/kyc" : "/client/dashboard/kyc";

  const symbol = walletData?.currency_symbol ?? "₦";
  const availableBalance = Number(walletData?.available_balance ?? 0);

  // ── Validation ────────────────────────────────────────────────────────────
  const amountNum = Number(amount);
  const amountValid = amountNum > 0 && amountNum <= availableBalance;
  const pinValid = pin.length === 4 && /^\d+$/.test(pin);
  const accountNumberValid = /^\d{10}$/.test(accountNumber);
  const formValid =
    amountValid &&
    pinValid &&
    accountNumberValid &&
    bankCode.trim().length > 0 &&
    accountName.trim().length > 0;

  // ── Submit handler ────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid) return;

    const payload: WithdrawalInput = {
      amount,
      pin,
      bank_code: bankCode,
      account_number: accountNumber,
      account_name: accountName,
    };

    withdraw.mutate(payload, {
      onSuccess: (result) => {
        toast.success(
          `${symbol} ${Number(result.amount).toLocaleString("en-NG", {
            minimumFractionDigits: 2,
          })} withdrawal initiated successfully!`,
        );
        // Reset form
        setAmount("");
        setPin("");
        setAccountNumber("");
        setAccountName("");
        setBankCode("");
      },
      onError: (err: unknown) => {
        const msg =
          err instanceof Error
            ? err.message
            : "Withdrawal failed. Please try again.";
        toast.error(msg);
      },
    });
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (kycLoading || walletLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 animate-pulse rounded-[28px] bg-[#F0F0F0]" />
        <div className="h-48 animate-pulse rounded-[28px] bg-[#F0F0F0]" />
      </div>
    );
  }

  // ── KYC Blocker ───────────────────────────────────────────────────────────
  if (!isKycApproved) {
    return (
      <div className="flex flex-col gap-6">
        <KycBlockerCard
          status={kycStatus}
          onGoToKyc={() => router.push(kycHref)}
        />
      </div>
    );
  }

  // ── Approved: Withdrawal Form ─────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* KYC Approved Badge */}
      <div className="flex items-center gap-2 rounded-[16px] border border-emerald-200 bg-emerald-50 px-5 py-3">
        <CheckCircle2 size={16} className="text-emerald-500" />
        <span className="text-sm font-semibold text-emerald-700">
          Identity verified — withdrawals are enabled.
        </span>
      </div>

      {/* Balance context */}
      <div className="rounded-[24px] bg-white p-6 shadow-card_shadow">
        <p className="text-xs font-bold uppercase tracking-widest text-[#858585]">
          Available Balance
        </p>
        <p className="mt-2 font-bon_foyage text-4xl text-black">
          {symbol}{" "}
          {availableBalance.toLocaleString("en-NG", {
            minimumFractionDigits: 2,
          })}
        </p>
        <p className="mt-1.5 text-xs text-[#858585]">
          Total: {symbol}{" "}
          {Number(walletData?.balance ?? 0).toLocaleString("en-NG", {
            minimumFractionDigits: 2,
          })}{" "}
          · Escrow:{" "}
          {Number(walletData?.escrow_balance ?? 0).toLocaleString("en-NG", {
            minimumFractionDigits: 2,
          })}
        </p>
      </div>

      {/* Withdrawal Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-[28px] bg-white p-8 shadow-card_shadow"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-[18px] bg-[#FDA600]/10 text-[#FDA600]">
            <Banknote size={22} />
          </div>
          <div>
            <p className="font-semibold text-black">Withdraw Funds</p>
            <p className="text-sm text-[#5A6465]">
              Funds move to your registered bank account.
            </p>
          </div>
        </div>

        {/* Amount */}
        <div className="mb-5">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-[#858585]">
            Amount ({symbol}) *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#858585]">
              {symbol}
            </span>
            <input
              type="number"
              required
              min="100"
              step="0.01"
              max={availableBalance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-[14px] border border-[#E5E7EB] bg-white py-3 pl-9 pr-4 text-sm text-black placeholder-[#C4C4C4] outline-none transition-all focus:border-[#01454A] focus:ring-2 focus:ring-[#01454A]/15"
            />
          </div>
          {amount && !amountValid && (
            <p className="mt-1.5 text-xs text-red-500">
              {amountNum <= 0
                ? "Amount must be greater than zero."
                : `Insufficient balance. Available: ${symbol} ${availableBalance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`}
            </p>
          )}
        </div>

        {/* PIN */}
        <div className="mb-5">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-[#858585]">
            4-Digit Wallet PIN *
          </label>
          <div className="relative">
            <Lock
              size={15}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#858585]"
            />
            <input
              type="password"
              required
              inputMode="numeric"
              maxLength={4}
              minLength={4}
              pattern="\d{4}"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="••••"
              className="w-full rounded-[14px] border border-[#E5E7EB] bg-white py-3 pl-10 pr-4 text-sm tracking-[0.5em] text-black placeholder-[#C4C4C4] outline-none transition-all focus:border-[#01454A] focus:ring-2 focus:ring-[#01454A]/15"
            />
          </div>
          {pin.length > 0 && !pinValid && (
            <p className="mt-1.5 text-xs text-red-500">
              PIN must be exactly 4 digits.
            </p>
          )}
        </div>

        <div className="mb-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-[#858585]">
              Bank Code *
            </label>
            <input
              type="text"
              required
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
              placeholder="058, 044, 033..."
              className="w-full rounded-[14px] border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-black placeholder-[#C4C4C4] outline-none transition-all focus:border-[#01454A] focus:ring-2 focus:ring-[#01454A]/15"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-[#858585]">
              Account Number *
            </label>
            <input
              type="text"
              required
              inputMode="numeric"
              maxLength={10}
              minLength={10}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="0123456789"
              className="w-full rounded-[14px] border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-black placeholder-[#C4C4C4] outline-none transition-all focus:border-[#01454A] focus:ring-2 focus:ring-[#01454A]/15"
            />
            {accountNumber.length > 0 && !accountNumberValid && (
              <p className="mt-1.5 text-xs text-red-500">
                Account number must be exactly 10 digits.
              </p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-[#858585]">
              Account Name *
            </label>
            <input
              type="text"
              required
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Verified bank account name"
              className="w-full rounded-[14px] border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-black placeholder-[#C4C4C4] outline-none transition-all focus:border-[#01454A] focus:ring-2 focus:ring-[#01454A]/15"
            />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mb-5 flex items-start gap-2 rounded-[12px] bg-[#FFF9EC] p-4">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-[#FDA600]" />
          <p className="text-xs text-[#5A6465]">
            Withdrawals are verified server-side against your wallet PIN and KYC
            status. Processing may take 1–3 business days.
          </p>
        </div>

        <button
          type="submit"
          disabled={!formValid || withdraw.isPending}
          className="w-full rounded-full bg-[#FDA600] py-4 text-sm font-bold text-black shadow-md transition-all duration-300 hover:bg-[#e59500] hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {withdraw.isPending ? "Processing..." : "Initiate Withdrawal"}
        </button>
      </form>
    </div>
  );
}

// ── KYC Blocker ───────────────────────────────────────────────────────────────

function KycBlockerCard({
  status,
  onGoToKyc,
}: {
  status: string;
  onGoToKyc: () => void;
}) {
  return (
    <div className="rounded-[28px] border-2 border-dashed border-amber-200 bg-amber-50 p-8">
      <div className="flex items-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-[20px] bg-white text-amber-500 shadow-sm">
          <ShieldAlert size={28} />
        </div>
        <div>
          <p className="text-lg font-bold text-black">
            Identity Verification Required
          </p>
          <p className="mt-0.5 text-sm text-[#5A6465]">
            KYC Status:{" "}
            <span className="font-semibold text-amber-700">
              {KYC_STATUS_LABELS[status] ?? status}
            </span>
          </p>
        </div>
      </div>

      <p className="mt-5 text-sm leading-7 text-[#5A6465]">
        To protect against fraud, withdrawals are only available to users with
        verified identities. Complete your KYC verification to unlock wallet
        withdrawals, payout setup, and high-value transactions.
      </p>

      <div className="mt-6 flex gap-3">
        <button
          onClick={onGoToKyc}
          className="flex items-center gap-2 rounded-[14px] bg-[#FDA600] px-6 py-3 text-sm font-bold text-white hover:bg-[#e59500]"
        >
          Complete KYC Verification
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
