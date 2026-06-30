/**
 * @file about-us/loading.tsx
 * @description About Us page skeleton — shown during SSR/ISR data fetching.
 */
export default function AboutUsLoading() {
  return (
    <main className="bg-[#F4F3EC]">
      {/* Hero skeleton */}
      <section className="flex flex-col md:flex-row gap-8 px-4 md:px-10 lg:px-20 py-12 animate-pulse">
        <div className="min-h-[280px] md:h-[520px] w-full md:w-1/2 rounded-2xl bg-muted/50" />
        <div className="flex flex-col justify-center gap-5 w-full md:w-1/2">
          <div className="h-2.5 w-20 rounded bg-[#fda600]/30" />
          <div className="h-12 w-72 rounded-xl bg-muted/60" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-muted/40" />
            <div className="h-4 w-5/6 rounded bg-muted/40" />
            <div className="h-4 w-4/5 rounded bg-muted/30" />
          </div>
          <div className="flex gap-3">
            <div className="h-11 w-32 rounded-full bg-[#fda600]/30" />
            <div className="h-11 w-32 rounded-full bg-muted/30" />
          </div>
        </div>
      </section>

      {/* Services grid skeleton */}
      <section className="px-4 md:px-10 lg:px-20 py-16">
        <div className="text-center mb-10 space-y-3 animate-pulse">
          <div className="h-2.5 w-20 mx-auto rounded bg-[#fda600]/30" />
          <div className="h-10 w-64 mx-auto rounded-xl bg-muted/60" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border/30 bg-card p-6 md:p-10 space-y-4 animate-pulse">
              <div className="h-12 w-12 rounded-xl bg-muted/50" />
              <div className="h-5 w-32 rounded bg-muted/50" />
              <div className="space-y-1.5">
                <div className="h-3 w-full rounded bg-muted/30" />
                <div className="h-3 w-4/5 rounded bg-muted/30" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
