/**
 * @file loading.tsx (Vendor Orders)
 * @description Page-specific skeleton matching the vendor orders table.
 */
import { TableRowSkeleton } from "@/shared/components/skeletons";

export default function VendorOrdersLoading() {
  return (
    <div className="space-y-5" aria-label="Loading orders" aria-busy="true">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="h-7 w-32 rounded bg-muted shimmer" />
        <div className="h-9 w-28 rounded-xl bg-muted shimmer" />
      </div>
      {/* Filter chips */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-20 rounded-full bg-muted shimmer" />
        ))}
      </div>
      {/* Orders table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <TableRowSkeleton columns={6} rows={10} />
      </div>
      {/* Pagination */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-9 rounded-lg bg-muted shimmer" />
        ))}
      </div>
    </div>
  );
}
