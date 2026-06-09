/**
 * @file loading.tsx (Vendor Payouts)
 * @description Vendor payouts page skeleton: summary + history table.
 */
import { StatSkeleton, TableRowSkeleton } from "@/components";

export default function VendorPayoutsLoading() {
  return (
    <div className="space-y-5" aria-label="Loading payouts" aria-busy="true">
      <div className="flex items-center justify-between">
        <div className="h-7 w-28 rounded bg-muted shimmer" />
        <div className="h-9 w-32 rounded-xl bg-muted shimmer" />
      </div>
      <StatSkeleton count={3} />
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <TableRowSkeleton columns={5} rows={8} />
      </div>
    </div>
  );
}
