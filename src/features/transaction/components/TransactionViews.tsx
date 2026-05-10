"use client";

/**
 * @file TransactionViews.tsx
 * @description Role-specific transaction dashboards.
 */
import { TransactionTable } from "./TransactionTable";
import { useTransactionSummary, useTransactions } from "../hooks/use-transactions";
import type { TransactionAudience } from "../types/transaction.types";

const titles: Record<TransactionAudience, { title: string; description: string }> = {
  client: {
    title: "Client Transactions",
    description: "Wallet top-ups, escrow holds, refunds, and measurement payments.",
  },
  vendor: {
    title: "Vendor Transactions",
    description: "Payouts, order releases, commission deductions, and disputes.",
  },
  admin: {
    title: "Platform Transactions",
    description: "Financial ledger movements across clients, vendors, and company wallets.",
  },
};

export function TransactionDashboardView({
  audience,
}: {
  audience: TransactionAudience;
}) {
  const copy = titles[audience];
  const { data, isLoading } = useTransactions();
  const { data: summary } = useTransactionSummary();

  return (
    <div className="flex flex-col gap-8 py-4">
      <div>
        <h1 className="font-bon_foyage text-5xl text-black">{copy.title}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[#5A6465]">
          {copy.description}
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard title="Inflow" value={`NGN ${Number(summary?.inflow ?? 0).toLocaleString("en-NG")}`} />
        <SummaryCard title="Outflow" value={`NGN ${Number(summary?.outflow ?? 0).toLocaleString("en-NG")}`} />
        <SummaryCard title="Entries" value={String(summary?.count ?? data?.count ?? 0)} />
      </section>

      <TransactionTable
        transactions={data?.results ?? []}
        isLoading={isLoading}
      />
    </div>
  );
}

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[24px] bg-white p-6 shadow-card_shadow">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#858585]">
        {title}
      </p>
      <p className="mt-4 font-bon_foyage text-4xl leading-none text-black">
        {value}
      </p>
    </div>
  );
}
