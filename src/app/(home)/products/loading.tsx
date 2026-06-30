/**
 * @file products/loading.tsx
 * @description Products page skeleton — shown while the Suspense boundary resolves.
 * Matches the exact layout of CatalogPage (header + sidebar + 4-col grid).
 */
export default function ProductsLoading() {
  return (
    <main className="min-h-screen bg-background">
      {/* Page header skeleton */}
      <div className="border-b border-border/40 bg-card/60 px-4 py-6 sm:px-6 lg:px-8 animate-pulse">
        <div className="mx-auto max-w-screen-2xl">
          <div className="h-8 w-52 rounded-xl bg-muted/60" />
          <div className="mt-2 h-4 w-36 rounded bg-muted/40" />
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          {/* Sidebar skeleton — desktop only */}
          <div className="hidden lg:block w-60 shrink-0 space-y-4 animate-pulse">
            <div className="h-5 w-28 rounded bg-muted/50" />
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-muted/40" />
                  <div className="h-3 w-24 rounded bg-muted/40" />
                </div>
              ))}
            </div>
            <div className="h-5 w-20 rounded bg-muted/50 mt-4" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-muted/40" />
                  <div className="h-3 w-20 rounded bg-muted/40" />
                </div>
              ))}
            </div>
          </div>

          {/* Product grid skeleton */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 animate-pulse">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-muted/30 overflow-hidden">
                  <div className="aspect-[4/5] w-full bg-muted/50" />
                  <div className="p-3 space-y-2">
                    <div className="h-2.5 w-14 rounded bg-muted/50" />
                    <div className="h-4 w-full rounded bg-muted/50" />
                    <div className="h-4 w-2/3 rounded bg-muted/40" />
                    <div className="h-5 w-20 rounded bg-muted/30" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
