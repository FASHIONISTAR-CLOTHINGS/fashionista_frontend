/**
 * app/(home)/categories/[slug]/loading.tsx
 *
 * Next.js streaming skeleton for the Category Detail page.
 * Shown while the RSC page.tsx is loading (Suspense boundary at route level).
 *
 * Matches the exact layout of page.tsx:
 *   1. Hero skeleton (full-width, dark bg)
 *   2. Sub-category grid skeleton (8 pill cards)
 *   3. Brand chip strip skeleton
 *   4. Product grid skeleton (8 product cards, 4-col on desktop)
 */
export default function CategoryDetailLoading() {
  return (
    <div className="bg-background text-foreground animate-pulse" aria-label="Loading category...">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative min-h-[280px] md:min-h-[380px] bg-[#01454A]/60 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#01454A]/80 to-transparent" />
        <div className="relative z-10 px-5 py-10 md:px-10 lg:px-20 space-y-4 pt-16">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2">
            <div className="h-3 w-10 rounded bg-white/20" />
            <div className="h-3 w-2 rounded bg-white/10" />
            <div className="h-3 w-20 rounded bg-white/20" />
            <div className="h-3 w-2 rounded bg-white/10" />
            <div className="h-3 w-28 rounded bg-white/20" />
          </div>
          {/* H1 */}
          <div className="h-12 w-2/3 rounded-lg bg-white/20 md:h-16" />
          {/* Stats row */}
          <div className="flex items-center gap-5">
            <div className="h-4 w-24 rounded bg-white/15" />
            <div className="h-4 w-32 rounded bg-white/15" />
          </div>
          {/* CTA buttons */}
          <div className="flex items-center gap-3 pt-2">
            <div className="h-11 w-28 rounded-full bg-[#FDA600]/30" />
            <div className="h-11 w-32 rounded-full bg-white/15" />
          </div>
        </div>
      </div>

      {/* ── Sub-category grid ──────────────────────────────────────────────── */}
      <div className="px-5 py-10 md:px-10 lg:px-20 border-b border-border">
        <div className="h-7 w-40 rounded bg-muted mb-6" />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border p-4"
              style={{ opacity: 1 - i * 0.07 }}
            >
              <div className="h-14 w-14 rounded-full bg-muted" />
              <div className="h-3 w-14 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Brand chip strip ───────────────────────────────────────────────── */}
      <div className="px-5 py-4 md:px-10 lg:px-20 border-b border-border">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-8 rounded-full bg-muted"
              style={{ width: `${60 + i * 14}px` }}
            />
          ))}
        </div>
      </div>

      {/* ── Product grid ───────────────────────────────────────────────────── */}
      <div className="px-5 py-10 md:px-10 lg:px-20">
        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-48 rounded-lg bg-muted" />
          <div className="h-4 w-20 rounded bg-muted" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border overflow-hidden"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="aspect-[3/4] bg-muted" />
              <div className="p-3 space-y-2">
                <div className="h-3 w-3/4 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
                <div className="h-5 w-1/3 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
