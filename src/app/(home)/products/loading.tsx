/**
 * @file loading.tsx (Home — product catalog listing)
 * @description Skeleton matching the catalog grid: filter sidebar + product card grid.
 */
import { CardGridSkeleton } from "@/shared/components/skeletons";

export default function CatalogLoading() {
  return (
    <div className="flex gap-6" aria-label="Loading catalog" aria-busy="true">
      {/* Filter sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 space-y-4">
        <div className="h-6 w-32 rounded bg-muted shimmer" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 rounded bg-muted shimmer" />
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-muted shimmer" />
                <div className="h-4 w-20 rounded bg-muted shimmer" />
              </div>
            ))}
          </div>
        ))}
      </aside>

      {/* Main grid */}
      <div className="flex-1 space-y-4">
        {/* Sort + results bar */}
        <div className="flex items-center justify-between">
          <div className="h-5 w-36 rounded bg-muted shimmer" />
          <div className="h-9 w-32 rounded-xl bg-muted shimmer" />
        </div>
        <CardGridSkeleton count={12} />
        {/* Pagination */}
        <div className="flex justify-center gap-2 pt-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-9 w-9 rounded-lg bg-muted shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}
