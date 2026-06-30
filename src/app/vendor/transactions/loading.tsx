/**
 * @file loading.tsx (Vendor Transactions)
 * @description Vendor transactions page skeleton.
 */
import { StatSkeleton, TableRowSkeleton } from "@/components";

export default function VendorTransactionsLoading() {
  return (
    <div className="space-y-5" aria-label="Loading transactions" aria-busy="true">
      <div className="flex items-center justify-between">
        <div className="h-7 w-36 rounded bg-muted shimmer" />
        <div className="h-9 w-28 rounded-xl bg-muted shimmer" />
      </div>
      <StatSkeleton count={3} />
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <TableRowSkeleton columns={6} rows={8} />
      </div>
    </div>
  );
}
