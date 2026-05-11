/**
 * @file loading.tsx (Client Address book)
 */

export default function ClientAddressLoading() {
  return (
    <div className="space-y-5 max-w-2xl" aria-label="Loading addresses" aria-busy="true">
      <div className="flex items-center justify-between">
        <div className="h-7 w-36 rounded bg-muted shimmer" />
        <div className="h-9 w-32 rounded-xl bg-muted shimmer" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-5 w-28 rounded bg-muted shimmer" />
            <div className="h-6 w-16 rounded-full bg-muted shimmer" />
          </div>
          <div className="h-4 w-full rounded bg-muted shimmer" />
          <div className="h-4 w-3/4 rounded bg-muted shimmer" />
        </div>
      ))}
    </div>
  );
}
