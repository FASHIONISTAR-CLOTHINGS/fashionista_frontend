/**
 * @file loading.tsx (Vendor Wallet)
 * @description Vendor wallet page skeleton: balance card + transaction history.
 */
import { StatSkeleton, TableRowSkeleton } from "@/components";

export default function VendorWalletLoading() {
  return (
    <div className="space-y-5" aria-label="Loading wallet" aria-busy="true">
      <div className="h-7 w-24 rounded bg-muted shimmer" />
      {/* Balance card */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="h-4 w-28 rounded bg-muted shimmer" />
        <div className="h-12 w-48 rounded bg-muted shimmer" />
        <div className="flex gap-3">
          <div className="h-10 w-32 rounded-xl bg-muted shimmer" />
          <div className="h-10 w-32 rounded-xl bg-muted shimmer" />
        </div>
      </div>
      {/* Stats */}
      <StatSkeleton count={3} />
      {/* Transactions */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="h-5 w-40 rounded bg-muted shimmer" />
        </div>
        <TableRowSkeleton columns={4} rows={7} />
      </div>
    </div>
  );
}
