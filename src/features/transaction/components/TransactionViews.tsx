"use client";

/**
 * @file TransactionViews.tsx
 * @description Enterprise-grade role-specific transaction dashboards.
 *
 * Wave 8 Upgrade:
 *  - Replaced DRF useTransactions/useTransactionSummary with Ninja async
 *    useNinjaTransactionDashboard() — 1 request vs 2, sub-30ms backend.
 *  - Role-specific stat cards: client (wallet), vendor (payout), admin (ledger).
 *  - Animated skeleton loading, status pills, colored amounts, motion rows.
 *  - ErrorBoundary-safe: errors surfaced via toast, never crash the page.
 */

import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useEffect } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Activity,
  TrendingUp,
  Wallet,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { useNinjaTransactionDashboard } from "../hooks/use-transactions";
import { TransactionTable } from "./TransactionTable";
import type { TransactionAudience } from "../types/transaction.types";


// ─────────────────────────────────────────────────────────────────────────────
// ROLE CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<
  TransactionAudience,
  {
    title: string;
    description: string;
    inflowLabel: string;
    outflowLabel: string;
    netLabel: string;
    accentColor: string;
    inflowIcon: React.ElementType;
    outflowIcon: React.ElementType;
    netIcon: React.ElementType;
  }
> = {
  client: {
    title: "My Transactions",
    description:
      "Your complete financial history — wallet top-ups, escrow holds, order payments and refunds.",
    inflowLabel: "Total Received",
    outflowLabel: "Total Spent",
    netLabel: "Net Balance",
    accentColor: "#01454A",
    inflowIcon: ArrowDownLeft,
    outflowIcon: ArrowUpRight,
    netIcon: Wallet,
  },
  vendor: {
    title: "Earnings & Payouts",
    description:
      "Revenue dashboard — order releases, commission deductions, payout history and disputes.",
    inflowLabel: "Total Earned",
    outflowLabel: "Commissions Paid",
    netLabel: "Net Revenue",
    accentColor: "#7C3AED",
    inflowIcon: TrendingUp,
    outflowIcon: BarChart3,
    netIcon: Wallet,
  },
  admin: {
    title: "Platform Financial Ledger",
    description:
      "Full-platform ledger — movements across client wallets, vendor payouts, and company accounts.",
    inflowLabel: "Platform Inflow",
    outflowLabel: "Platform Outflow",
    netLabel: "Net Movement",
    accentColor: "#0EA5E9",
    inflowIcon: ArrowDownLeft,
    outflowIcon: ArrowUpRight,
    netIcon: Activity,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD — animated
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  delay = 0,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="rounded-2xl bg-white p-6 shadow-card_shadow flex items-start gap-4"
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}18` }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#858585] truncate">
          {label}
        </p>
        <p
          className="mt-1.5 font-bon_foyage text-3xl leading-none text-black truncate"
          style={{ color: value.startsWith("-") ? "#EA1705" : "inherit" }}
        >
          {value}
        </p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON — shown during first load
// ─────────────────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8 py-4">
      <div className="space-y-2">
        <div className="h-10 w-64 bg-[#F0F2F5] rounded-lg animate-pulse" />
        <div className="h-5 w-96 bg-[#F0F2F5] rounded animate-pulse" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-[#F0F2F5] animate-pulse"
          />
        ))}
      </div>
      <div className="space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-14 rounded-xl bg-[#F0F2F5] animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function TransactionDashboardView({
  audience,
}: {
  audience: TransactionAudience;
}) {
  const cfg = ROLE_CONFIG[audience];
  const { data, isLoading, isError, refetch, isFetching } =
    useNinjaTransactionDashboard();

  useEffect(() => {
    if (!isError) return;

    toast.error("Failed to load transaction data. Please refresh.", {
      id: `transaction-dashboard-error-${audience}`,
    });
  }, [audience, isError]);

  if (isLoading) return <DashboardSkeleton />;

  const fmt = (v: string | undefined) =>
    `NGN ${Number(v ?? 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

  const inflow = fmt(data?.inflow);
  const outflow = fmt(data?.outflow);
  const net = fmt(data?.net);
  const rows = data?.recent_transactions ?? [];

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-bon_foyage text-4xl md:text-5xl text-black"
          >
            {cfg.title}
          </motion.h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-[#5A6465]">
            {cfg.description}
          </p>
        </div>

        <button
          onClick={() => void refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 rounded-xl border border-[#F0F2F5] bg-white px-4 py-2.5 text-sm font-semibold text-[#475367] hover:bg-[#F8F9FC] transition-colors disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={isFetching ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <AnimatePresence mode="wait">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label={cfg.inflowLabel}
            value={inflow}
            icon={cfg.inflowIcon}
            color={cfg.accentColor}
            delay={0}
          />
          <StatCard
            label={cfg.outflowLabel}
            value={outflow}
            icon={cfg.outflowIcon}
            color="#EA1705"
            delay={0.08}
          />
          <StatCard
            label={cfg.netLabel}
            value={net}
            icon={cfg.netIcon}
            color={cfg.accentColor}
            delay={0.16}
          />
        </div>
      </AnimatePresence>

      {/* ── Recent Transactions Table ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl bg-white shadow-card_shadow overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F2F5]">
          <h2 className="font-satoshi font-semibold text-lg text-black">
            Recent Transactions
          </h2>
          <span className="text-xs text-[#858585] font-medium">
            {rows.length} entries
          </span>
        </div>
        <TransactionTable transactions={rows} isLoading={false} />
      </motion.div>
    </div>
  );
}
