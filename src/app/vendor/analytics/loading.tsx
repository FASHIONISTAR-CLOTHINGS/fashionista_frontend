/**
 * @file loading.tsx (Vendor Analytics)
 * @description Page-specific skeleton matching the analytics charts layout.
 */
import { StatSkeleton } from "@/shared/components/skeletons";

export default function VendorAnalyticsLoading() {
  return (
    <div className="space-y-5" aria-label="Loading analytics" aria-busy="true">
      <div className="h-7 w-36 rounded bg-muted shimmer" />
      <StatSkeleton count={4} />
      {/* Main chart area */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 rounded bg-muted shimmer" />
          <div className="h-8 w-28 rounded-lg bg-muted shimmer" />
        </div>
        <div className="h-64 w-full rounded-xl bg-muted shimmer" />
      </div>
      {/* Bottom split: product performance + top products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <div className="h-5 w-40 rounded bg-muted shimmer" />
          <div className="h-48 w-full rounded-xl bg-muted shimmer" />
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <div className="h-5 w-36 rounded bg-muted shimmer" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-center">
              <div className="h-10 w-10 rounded-lg bg-muted shimmer flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-3/4 rounded bg-muted shimmer" />
                <div className="h-3 w-1/2 rounded bg-muted shimmer" />
              </div>
              <div className="h-5 w-16 rounded-full bg-muted shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
