"use client";

/**
 * @file WalletDashboardView.tsx
 * @description Full wallet dashboard using Ninja async snapshot.
 * Renders: balance cards, hold stats, PIN status, account details.
 *
 * Data source: GET /ninja/wallet/dashboard/ → Wallet.aget_full_dashboard_data()
 */
import { AlertCircle, Lock, Shield, Wallet } from "lucide-react";
import { useWalletDashboard } from "../hooks/use-wallet";
import { WithdrawalPanel } from "./WithdrawalPanel";

type Props = {
  title?: string;
  audience?: "client" | "vendor";
};

export function WalletDashboardView({ title = "Wallet", audience = "client" }: Props) {
  const { data, isLoading, isError } = useWalletDashboard();

  const currency = data?.currency_code ?? "NGN";
  const symbol = data?.currency_symbol ?? "₦";

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Header */}
      <div>
        <h1 className="font-bon_foyage text-5xl text-black">{title}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[#5A6465]">
          Real-time balance snapshot, escrow exposure, pending funds, and transaction PIN readiness.
        </p>
      </div>

      {/* Balance Cards — 4 cols */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BalanceCard
          label="Available"
          value={money(data?.available_balance, symbol, isLoading)}
          accent="#22c55e"
          loading={isLoading}
        />
        <BalanceCard
          label="Total Balance"
          value={money(data?.balance, symbol, isLoading)}
          accent="#FDA600"
          loading={isLoading}
        />
        <BalanceCard
          label="Escrow"
          value={money(data?.escrow_balance, symbol, isLoading)}
          accent="#6366f1"
          loading={isLoading}
        />
        <BalanceCard
          label="Pending"
          value={money(data?.pending_balance, symbol, isLoading)}
          accent="#f59e0b"
          loading={isLoading}
        />
      </section>

      {/* Hold Stats + PIN Status — 2 cols */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[28px] bg-white p-7 shadow-card_shadow">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-[16px] bg-orange-50 text-orange-500">
              <Shield size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#858585]">Active Holds</p>
              <p className="mt-1 font-bon_foyage text-3xl text-black">
                {isLoading ? "—" : (data?.active_holds_count ?? 0)}
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm text-[#5A6465]">
            Total held:{" "}
            <span className="font-semibold text-black">
              {money(data?.total_held_amount, symbol, isLoading)}
            </span>
          </p>
        </div>

        <div className="rounded-[28px] bg-white p-7 shadow-card_shadow">
          <div className="flex items-center gap-3">
            <div
              className={`flex size-11 items-center justify-center rounded-[16px] ${
                data?.has_pin ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
              }`}
            >
              <Lock size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#858585]">PIN Status</p>
              <p className="mt-1 font-bon_foyage text-3xl text-black">
                {isLoading ? "—" : data?.has_pin ? "Active" : "Not Set"}
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm text-[#5A6465]">
            {data?.has_pin
              ? "4-digit PIN protects all outbound transactions."
              : "Set a PIN to enable wallet payments and transfers."}
          </p>
        </div>
      </section>

      {/* Account Details Card */}
      <div className="rounded-[32px] bg-white p-8 shadow-card_shadow">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-[18px] bg-[#FDA600]/10 text-[#FDA600]">
            <Wallet />
          </div>
          <div>
            <p className="text-lg font-semibold text-black">
              {isLoading ? "Loading..." : (data?.name ?? "Fashionistar Wallet")}
            </p>
            <p className="text-sm text-[#5A6465]">
              {data?.bank_name ?? "Fashionistar Wallet"}
              {data?.account_number ? ` — ${data.account_number}` : ""}
              {data?.account_name ? ` (${data.account_name})` : ""}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <InfoPill label="Provider" value={data?.provider ?? "internal"} loading={isLoading} />
          <InfoPill label="Status" value={data?.status ?? "active"} loading={isLoading} />
          <InfoPill label="Currency" value={currency} loading={isLoading} />
        </div>
      </div>

      <WithdrawalPanel audience={audience} />

      {/* Error Banner */}
      {isError && (
        <div className="flex items-center gap-3 rounded-[20px] border border-red-100 bg-red-50 p-5 text-sm text-red-700">
          <AlertCircle size={18} />
          <span>
            Wallet data could not be loaded. The Ninja dashboard endpoint may not be mounted yet.
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function BalanceCard({
  label,
  value,
  accent,
  loading,
}: {
  label: string;
  value: string;
  accent: string;
  loading: boolean;
}) {
  return (
    <div className="rounded-[24px] bg-white p-6 shadow-card_shadow">
      <div className="mb-3 h-1.5 w-8 rounded-full" style={{ backgroundColor: accent }} />
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#858585]">{label}</p>
      <p
        className={`mt-3 font-bon_foyage text-3xl leading-none ${
          loading ? "animate-pulse text-[#D9D9D9]" : "text-black"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function InfoPill({
  label,
  value,
  loading,
}: {
  label: string;
  value: string;
  loading: boolean;
}) {
  return (
    <div className="rounded-[14px] bg-[#F8F9FC] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#858585]">{label}</p>
      <p className={`mt-1 text-sm font-medium capitalize ${loading ? "text-[#D9D9D9]" : "text-black"}`}>
        {loading ? "—" : value}
      </p>
    </div>
  );
}

function money(value: string | undefined, symbol: string, loading: boolean) {
  if (loading) return "—";
  return `${symbol} ${Number(value ?? 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}
