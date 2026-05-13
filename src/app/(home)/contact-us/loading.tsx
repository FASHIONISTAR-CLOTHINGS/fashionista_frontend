/**
 * @file contact-us/loading.tsx
 * @description Contact Us page skeleton.
 */
export default function ContactUsLoading() {
  return (
    <main className="bg-background">
      {/* Hero skeleton */}
      <section className="bg-[#01454A] px-4 py-16 md:px-8 lg:px-20 animate-pulse">
        <div className="h-2.5 w-20 rounded bg-[#fda600]/30 mb-4" />
        <div className="h-14 w-80 rounded-xl bg-white/10 mb-4 md:h-20" />
        <div className="space-y-2 max-w-lg">
          <div className="h-4 w-full rounded bg-white/10" />
          <div className="h-4 w-4/5 rounded bg-white/10" />
        </div>
      </section>

      {/* Topic cards skeleton */}
      <section className="px-4 py-12 md:px-8 lg:px-20 border-b border-border/40">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border/30 bg-card p-6 space-y-3 animate-pulse">
              <div className="h-7 w-7 rounded-lg bg-muted/50" />
              <div className="h-5 w-32 rounded bg-muted/50" />
              <div className="space-y-1">
                <div className="h-3 w-full rounded bg-muted/30" />
                <div className="h-3 w-3/4 rounded bg-muted/30" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Form skeleton */}
      <section className="px-4 py-16 md:px-8 lg:px-20">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
          <div className="flex-1 space-y-5 animate-pulse">
            <div className="space-y-2">
              <div className="h-2.5 w-24 rounded bg-muted/40" />
              <div className="h-8 w-48 rounded-xl bg-muted/50" />
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-2.5 w-24 rounded bg-muted/40" />
                <div className="h-12 w-full rounded-xl bg-muted/30" />
              </div>
            ))}
            <div className="h-36 w-full rounded-xl bg-muted/30" />
            <div className="h-12 w-40 rounded-full bg-[#fda600]/30" />
          </div>

          <div className="hidden lg:flex flex-col gap-6 w-80">
            <div className="rounded-2xl border border-border/30 bg-card p-6 space-y-4 animate-pulse">
              <div className="h-5 w-28 rounded bg-muted/50" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-5 w-5 rounded bg-muted/40" />
                  <div className="space-y-1">
                    <div className="h-2.5 w-16 rounded bg-muted/40" />
                    <div className="h-3.5 w-36 rounded bg-muted/30" />
                  </div>
                </div>
              ))}
            </div>
            <div className="h-64 w-full rounded-2xl bg-muted/30" />
          </div>
        </div>
      </section>
    </main>
  );
}
