/**
 * @file loading.tsx (Vendor Customers)
 * @description Vendor customers page skeleton.
 */
import { TableRowSkeleton, StatSkeleton } from "@/shared/components/skeletons";

export default function VendorCustomersLoading() {
  return (
    <div className="space-y-5" aria-label="Loading customers" aria-busy="true">
      <div className="flex items-center justify-between">
        <div className="h-7 w-36 rounded bg-muted shimmer" />
        <div className="h-9 w-28 rounded-xl bg-muted shimmer" />
      </div>
      <StatSkeleton count={3} />
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <TableRowSkeleton columns={5} rows={8} />
      </div>
    </div>
  );
}
