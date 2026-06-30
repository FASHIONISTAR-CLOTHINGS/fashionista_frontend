"use client";

/**
 * @file WalletOverviewView.tsx
 * @description Role-aware wallet overview card and balances.
 */
import { Wallet } from "lucide-react";
import { useWallet } from "../hooks/use-wallet";

export function WalletOverviewView({ title = "Wallet" }: { title?: string }) {
  const { data, isLoading } = useWallet();
  const currency = typeof data?.currency === "string"
    ? data.currency
    : data?.currency?.code ?? "NGN";

  return (
    <div className="flex flex-col gap-8 py-4">
      <div>
        <h1 className="font-bon_foyage text-5xl text-black">{title}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[#5A6465]">
          Review available balance, escrow exposure, pending funds, and transaction PIN readiness.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <WalletCard label="Available" value={money(data?.available_balance, currency, isLoading)} />
        <WalletCard label="Escrow" value={money(data?.escrow_balance, currency, isLoading)} />
        <WalletCard label="Pending" value={money(data?.pending_balance, currency, isLoading)} />
        <WalletCard label="PIN" value={data?.has_pin ? "Ready" : "Not set"} />
      </section>

      <div className="rounded-[32px] bg-white p-8 shadow-card_shadow">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-[18px] bg-[#FDA600]/10 text-[#FDA600]">
            <Wallet />
          </div>
          <div>
            <p className="text-lg font-semibold text-black">{data?.name ?? "Fashionistar Wallet"}</p>
            <p className="text-sm text-[#5A6465]">
              {data?.bank_name ?? "Fashionistar Wallet"} {data?.account_number ? `- ${data.account_number}` : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function WalletCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] bg-white p-6 shadow-card_shadow">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#858585]">
        {label}
      </p>
      <p className="mt-4 font-bon_foyage text-4xl leading-none text-black">
        {value}
      </p>
    </div>
  );
}

function money(value: string | undefined, currency: string, loading: boolean) {
  if (loading) return "-";
  return `${currency} ${Number(value ?? 0).toLocaleString("en-NG")}`;
}
