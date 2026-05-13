/**
 * @file loading.tsx (Client Order Detail — [order_id])
 *
 * Skeleton shown while the client order detail page loads.
 * Canonical route segment: [order_id] (matches page.tsx in the same folder).
 */
export default function ClientOrderDetailLoading() {
  return (
    <div className="space-y-5 max-w-3xl" aria-label="Loading order details" aria-busy="true">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-muted shimmer" />
        <div className="h-7 w-48 rounded bg-muted shimmer" />
        <div className="h-6 w-20 rounded-full bg-muted shimmer ml-auto" />
      </div>
      {/* Summary card */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
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
      {/* Order meta */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 w-28 rounded bg-muted shimmer" />
            <div className="h-4 w-32 rounded bg-muted shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}
