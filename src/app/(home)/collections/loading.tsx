/**
 * @file collections/loading.tsx
 * @description Collections page skeleton — shown while CatalogCollectionGrid loads.
 */
export default function CollectionsLoading() {
  return (
    <main className="bg-background">
      {/* Hero skeleton */}
      <section className="bg-[#01454A] px-4 py-20 md:px-8 lg:px-20 animate-pulse">
        <div className="h-3 w-24 rounded bg-[#fda600]/30 mb-4" />
        <div className="h-14 w-80 rounded-xl bg-white/10 mb-4 md:h-20" />
        <div className="h-4 w-full max-w-lg rounded bg-white/10 mb-2" />
        <div className="h-4 w-2/3 max-w-md rounded bg-white/10 mb-8" />
        <div className="flex gap-3">
          <div className="h-11 w-36 rounded-full bg-[#fda600]/30" />
          <div className="h-11 w-36 rounded-full bg-white/10" />
        </div>
      </section>

      {/* Grid skeleton */}
      <section className="px-4 py-12 md:px-8 lg:px-20">
        <div className="mb-8 space-y-2 animate-pulse">
          <div className="h-2 w-24 rounded bg-muted/40" />
          <div className="h-8 w-48 rounded bg-muted/50" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-border/30 animate-pulse">
              <div className="aspect-[4/3] w-full bg-muted/50" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 rounded bg-muted/50" />
                <div className="h-3 w-1/2 rounded bg-muted/30" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
