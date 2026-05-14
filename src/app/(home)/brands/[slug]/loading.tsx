export default function BrandDetailLoading() {
  return (
    <div className="space-y-8" aria-label="Loading brand detail" aria-busy="true">
      <section className="relative min-h-[300px] overflow-hidden rounded-3xl bg-muted/50 px-5 py-12 md:min-h-[380px] md:px-10 lg:px-20">
        <div className="space-y-4 max-w-3xl">
          <div className="h-4 w-40 rounded bg-muted shimmer" />
          <div className="h-4 w-20 rounded bg-muted shimmer" />
          <div className="h-14 w-2/3 rounded bg-muted shimmer" />
          <div className="h-5 w-full max-w-xl rounded bg-muted shimmer" />
          <div className="h-11 w-36 rounded-full bg-muted shimmer" />
        </div>
      </section>

      <section className="space-y-6 px-5 py-4 md:px-10 lg:px-20">
        <div className="h-10 w-56 rounded bg-muted shimmer" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-2xl border border-border bg-card p-4">
              <div className="aspect-square rounded-xl bg-muted shimmer" />
              <div className="h-4 w-3/4 rounded bg-muted shimmer" />
              <div className="h-4 w-1/2 rounded bg-muted shimmer" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
