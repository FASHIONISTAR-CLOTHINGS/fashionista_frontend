"use client";

/**
 * @file TransactionTable.tsx
 * @description Shared transaction table used by role-specific transaction views.
 */
import { PackageOpen } from "lucide-react";
import type { TransactionRecord } from "../types/transaction.types";

const statusClasses: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  processing: "bg-blue-50 text-blue-700",
  completed: "bg-emerald-50 text-emerald-700",
  failed: "bg-red-50 text-red-700",
  cancelled: "bg-slate-100 text-slate-600",
  reversed: "bg-slate-100 text-slate-600",
  disputed: "bg-orange-50 text-orange-700",
};

type TransactionTableProps = {
  transactions: TransactionRecord[];
  isLoading?: boolean;
};

export function TransactionTable({
  transactions,
  isLoading = false,
}: TransactionTableProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-14 rounded-xl bg-[#F0F2F5] shimmer" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
        <PackageOpen className="text-[#D9D9D9]" />
        <p className="text-sm font-medium text-[#475367]">No transactions yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[20px] border border-[#F0F2F5] bg-white">
      <table className="min-w-full divide-y divide-[#F0F2F5]">
        <thead className="bg-[#F8F9FC]">
          <tr className="text-left text-xs font-semibold uppercase tracking-[0.12em] text-[#475367]">
            <th className="px-5 py-3">Reference</th>
            <th className="px-5 py-3">Type</th>
            <th className="px-5 py-3">Direction</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Net</th>
            <th className="px-5 py-3">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F0F2F5]">
          {transactions.map((tx) => (
            <tr key={tx.id} className="text-sm text-black transition hover:bg-[#FFFBF0]">
              <td className="px-5 py-4 font-semibold">{tx.reference || tx.id}</td>
              <td className="px-5 py-4 capitalize">{tx.transaction_type.replace(/_/g, " ")}</td>
              <td className="px-5 py-4 capitalize">{tx.direction}</td>
              <td className="px-5 py-4">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[tx.status] ?? "bg-slate-100 text-slate-600"}`}>
                  {tx.status}
                </span>
              </td>
              <td className="px-5 py-4 font-semibold">
                NGN {Number(tx.net_amount || tx.amount).toLocaleString("en-NG")}
              </td>
              <td className="px-5 py-4 text-[#475367]">
                {tx.created_at ? new Date(tx.created_at).toLocaleDateString("en-NG") : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
