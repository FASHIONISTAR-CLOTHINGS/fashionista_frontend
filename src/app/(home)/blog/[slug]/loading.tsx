/**
 * @file loading.tsx (Blog post — [slug])
 * @description Skeleton for a single blog article: hero + content + sidebar.
 */
export default function BlogPostLoading() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-6xl mx-auto"
      aria-label="Loading article" aria-busy="true">
      {/* Article */}
      <article className="lg:col-span-3 space-y-5">
        <div className="h-64 w-full rounded-2xl bg-muted shimmer" />
        <div className="h-9 w-3/4 rounded bg-muted shimmer" />
        <div className="flex gap-3 items-center">
          <div className="h-8 w-8 rounded-full bg-muted shimmer" />
          <div className="h-4 w-32 rounded bg-muted shimmer" />
          <div className="h-4 w-24 rounded bg-muted shimmer" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-full rounded bg-muted shimmer" />
            <div className="h-4 w-11/12 rounded bg-muted shimmer" />
            <div className="h-4 w-4/5 rounded bg-muted shimmer" />
          </div>
        ))}
      </article>
      {/* Sidebar */}
      <aside className="hidden lg:block space-y-5">
        <div className="h-5 w-28 rounded bg-muted shimmer" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-20 w-full rounded-xl bg-muted shimmer" />
            <div className="h-4 w-3/4 rounded bg-muted shimmer" />
            <div className="h-3 w-1/2 rounded bg-muted shimmer" />
          </div>
        ))}
      </aside>
    </div>
  );
}
