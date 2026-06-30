/**
 * @file brands/loading.tsx
 * @description Brands listing skeleton — shown while page.tsx fetches brands.
 */
export default function BrandsLoading() {
  return (
    <main className="bg-background">
      {/* Hero skeleton */}
      <section className="bg-[#0D0D0D] px-4 py-20 md:px-8 lg:px-20 animate-pulse">
        <div className="h-3 w-20 rounded bg-[#fda600]/30 mb-4" />
        <div className="h-14 w-72 rounded-xl bg-white/10 mb-4 md:h-20 md:w-96" />
        <div className="h-4 w-full max-w-lg rounded bg-white/10 mb-2" />
        <div className="h-4 w-2/3 max-w-md rounded bg-white/10 mb-8" />
        <div className="flex gap-3">
          <div className="h-11 w-36 rounded-full bg-[#fda600]/30" />
          <div className="h-11 w-36 rounded-full bg-white/10" />
        </div>
      </section>

      {/* Stats skeleton */}
      <section className="border-b border-border/40 bg-card/60 px-4 py-6 md:px-8 lg:px-20">
        <div className="flex gap-8 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-6 w-16 rounded bg-muted/50" />
              <div className="h-3 w-20 rounded bg-muted/30" />
            </div>
          ))}
        </div>
      </section>

      {/* Grid skeleton */}
      <section className="px-4 py-12 md:px-8 lg:px-20">
        <div className="mb-8 space-y-2 animate-pulse">
          <div className="h-2 w-20 rounded bg-muted/40" />
          <div className="h-8 w-40 rounded bg-muted/50" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center rounded-2xl border border-border/30 bg-card p-5 space-y-3 animate-pulse"
            >
              <div className="h-20 w-full rounded-xl bg-muted/50" />
              <div className="h-3 w-24 rounded bg-muted/50" />
              <div className="h-2 w-16 rounded bg-muted/30" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
