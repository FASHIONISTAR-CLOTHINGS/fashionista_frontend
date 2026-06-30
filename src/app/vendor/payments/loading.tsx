/**
 * @file loading.tsx (Vendor Payments)
 * @description Vendor payments page skeleton.
 */
import { StatSkeleton, TableRowSkeleton } from "@/components";

export default function VendorPaymentsLoading() {
  return (
    <div className="space-y-5" aria-label="Loading payments" aria-busy="true">
      <div className="h-7 w-32 rounded bg-muted shimmer" />
      <StatSkeleton count={3} />
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <TableRowSkeleton columns={5} rows={7} />
      </div>
    </div>
  );
}
