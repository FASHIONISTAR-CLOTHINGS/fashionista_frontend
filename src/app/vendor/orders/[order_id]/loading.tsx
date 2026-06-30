/**
 * @file loading.tsx (Vendor Order Detail — [order_id])
 *
 * Skeleton shown while the vendor order detail page loads.
 * Canonical route segment: [order_id] (matches page.tsx in the same folder).
 */
export default function VendorOrderDetailLoading() {
  return (
    <div className="space-y-5 max-w-3xl" aria-label="Loading order" aria-busy="true">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-muted shimmer" />
        <div className="h-7 w-52 rounded bg-muted shimmer" />
        <div className="h-6 w-24 rounded-full bg-muted shimmer ml-auto" />
      </div>
      {/* Items */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="h-5 w-28 rounded bg-muted shimmer" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="h-16 w-16 rounded-xl bg-muted shimmer flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-muted shimmer" />
              <div className="h-3 w-1/2 rounded bg-muted shimmer" />
            </div>
            <div className="h-5 w-20 rounded bg-muted shimmer" />
          </div>
        ))}
      </div>
      {/* Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-3">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex justify-between">
                <div className="h-4 w-24 rounded bg-muted shimmer" />
                <div className="h-4 w-28 rounded bg-muted shimmer" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
