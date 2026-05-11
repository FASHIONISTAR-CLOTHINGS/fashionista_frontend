/**
 * @file loading.tsx (Vendor Dashboard)
 * @description Page-specific loading skeleton matching the vendor dashboard layout.
 * Uses shared skeleton primitives from @/shared/components/skeletons.
 */
import {
  StatSkeleton,
  TableRowSkeleton,
} from "@/shared/components/skeletons";

export default function VendorDashboardLoading() {
  return (
    <div className="space-y-6" aria-label="Loading vendor dashboard" aria-busy="true">
      {/* Stats row */}
      <StatSkeleton count={4} />

      {/* Recent orders table */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="h-5 w-36 rounded bg-muted shimmer" />
        <TableRowSkeleton columns={5} rows={6} />
      </div>

      {/* Bottom row: chart placeholder + quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <div className="h-5 w-28 rounded bg-muted shimmer" />
          <div className="h-48 w-full rounded-xl bg-muted shimmer" />
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <div className="h-5 w-32 rounded bg-muted shimmer" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-muted shimmer flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-3/4 rounded bg-muted shimmer" />
                <div className="h-3 w-1/2 rounded bg-muted shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
