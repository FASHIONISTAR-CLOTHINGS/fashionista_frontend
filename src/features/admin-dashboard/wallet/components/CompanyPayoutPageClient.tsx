"use client";

/**
 * features/admin-dashboard/wallet/components/CompanyPayoutPageClient.tsx
 *
 * Full-screen premium Company Payout page client component.
 *
 * Layout:
 *   Left Column (2/3):  Live balance header + CompanyWithdrawalPanel form
 *   Right Column (1/3): Security guide + Recent payout history
 */

import { useCompanyWalletBalance } from "../hooks";
import { CompanyWithdrawalPanel } from "./CompanyWithdrawalPanel";
import {
  ShieldCheck,
  TrendingUp,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Loader2,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatNGN(value: string | number | undefined): string {
  const num =
    typeof value === "string" ? parseFloat(value) : (value ?? 0);
  if (isNaN(num)) return "₦0.00";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(num);
}

// ── Static recent payout history (replace with API query when endpoint ready) ─

const RECENT_PAYOUTS = [
  {
    id: "CPO-001",
    amount: "1,250,000.00",
    status: "completed",
    date: "2026-06-01",
    account: "FASHIONISTAR CLOTHINGS LTD",
    bank: "Access Bank",
  },
  {
    id: "CPO-002",
    amount: "875,500.00",
    status: "completed",
    date: "2026-05-15",
    account: "FASHIONISTAR CLOTHINGS LTD",
    bank: "GTBank",
  },
  {
    id: "CPO-003",
    amount: "2,100,000.00",
    status: "completed",
    date: "2026-05-01",
    account: "FASHIONISTAR GROUP",
    bank: "Zenith Bank",
  },
];

// ── Main Client Component ─────────────────────────────────────────────────────

export function CompanyPayoutPageClient() {
  const { data: balance, isLoading } = useCompanyWalletBalance();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
      {/* Page Header */}
      <div className="border-b border-zinc-200/80 bg-white/80 backdrop-blur-sm px-8 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">
                Company Commission Payout
              </h1>
              <p className="text-sm text-zinc-500">
                Fashionistar Financial Operations · Double-Door Secured
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="border-b border-zinc-100 bg-white px-8 py-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-3 gap-6 md:grid-cols-6">
            <div className="col-span-2 md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Available Balance
              </p>
              {isLoading ? (
                <div className="mt-1 h-8 w-40 animate-pulse rounded bg-zinc-100" />
              ) : (
                <p className="mt-0.5 text-2xl font-extrabold text-teal-700">
                  {formatNGN(balance?.available_balance)}
                </p>
              )}
            </div>
            <div className="col-span-1 md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Pending Balance
              </p>
              {isLoading ? (
                <div className="mt-1 h-8 w-32 animate-pulse rounded bg-zinc-100" />
              ) : (
                <p className="mt-0.5 text-2xl font-extrabold text-amber-600">
                  {formatNGN(balance?.pending_balance)}
                </p>
              )}
            </div>
            <div className="col-span-1 md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Wallet Status
              </p>
              <div className="mt-1 flex items-center gap-2">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${
                    balance?.status === "active"
                      ? "bg-emerald-400"
                      : "bg-red-400"
                  }`}
                />
                <p className="text-sm font-bold capitalize text-zinc-700">
                  {balance?.status ?? "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="mx-auto max-w-7xl px-8 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left: Withdrawal Form (2/3) */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="flex min-h-[400px] items-center justify-center rounded-3xl bg-white shadow-xl">
                <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
              </div>
            ) : (
              <CompanyWithdrawalPanel
                availableBalance={balance?.available_balance}
              />
            )}
          </div>

          {/* Right: Security Guide + History (1/3) */}
          <div className="space-y-6">
            {/* Security Guide Card */}
            <div className="rounded-3xl border border-zinc-200/70 bg-white p-6 shadow-lg">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-700">
                <ShieldCheck className="h-4 w-4 text-teal-500" />
                Double-Door Security
              </h3>
              <div className="space-y-3">
                <div className="rounded-xl bg-teal-50 p-3">
                  <p className="text-xs font-bold text-teal-800">Door 1 — Identity</p>
                  <p className="mt-0.5 text-xs text-teal-700">
                    You must be authenticated as{" "}
                    <span className="font-mono font-semibold">
                      fashionistarclothings
                      <wbr />
                      @outlook.com
                    </span>
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3">
                  <p className="text-xs font-bold text-emerald-800">Door 2 — Domain</p>
                  <p className="mt-0.5 text-xs text-emerald-700">
                    Account name MUST contain the keyword{" "}
                    <span className="font-bold font-mono">FASHIONISTAR</span>.
                    This prevents redirection to personal accounts.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <p className="text-xs text-amber-700">
                  All company payout requests are logged at CRITICAL level and
                  notified to the Fashionistar SIEM monitoring system.
                </p>
              </div>
            </div>

            {/* Commission Rate Card */}
            <div className="rounded-3xl border border-zinc-200/70 bg-white p-6 shadow-lg">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-700">
                <TrendingUp className="h-4 w-4 text-indigo-500" />
                Platform Commission
              </h3>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-extrabold text-zinc-900">10</span>
                <span className="mb-1 text-xl font-bold text-zinc-400">%</span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                Per-order platform commission deducted at escrow release.
                Accumulated in the Company Wallet for periodic payout.
              </p>
            </div>

            {/* Recent Payouts */}
            <div className="rounded-3xl border border-zinc-200/70 bg-white p-6 shadow-lg">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-700">
                <Clock className="h-4 w-4 text-zinc-400" />
                Recent Payouts
              </h3>
              <div className="space-y-3">
                {RECENT_PAYOUTS.map((payout) => (
                  <div
                    key={payout.id}
                    className="flex items-start justify-between rounded-xl border border-zinc-100 p-3"
                  >
                    <div>
                      <p className="text-xs font-semibold text-zinc-800">
                        ₦{payout.amount}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-400">
                        {payout.bank} · {payout.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5">
                      <ArrowUpRight className="h-3 w-3 text-emerald-700" />
                      <span className="text-xs font-semibold text-emerald-700 capitalize">
                        {payout.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
