/**
 * @file loading.tsx (Vendor Coupons)
 */
import { TableRowSkeleton } from "@/components";

export default function VendorCouponsLoading() {
  return (
    <div className="space-y-5" aria-label="Loading coupons" aria-busy="true">
      <div className="flex items-center justify-between">
        <div className="h-7 w-28 rounded bg-muted shimmer" />
        <div className="h-9 w-32 rounded-xl bg-muted shimmer" />
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <TableRowSkeleton columns={5} rows={6} />
      </div>
    </div>
  );
}
