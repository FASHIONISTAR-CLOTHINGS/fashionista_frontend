/**
 * @file ProductCardSkeleton.tsx
 * @description Pure CSS shimmer skeleton for ProductCard.
 * Server-renderable — no client JS needed. Used as `loading.tsx` fallback
 * and as `Suspense` boundary fallback for product grids.
 */

export default function ProductCardSkeleton() {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
      aria-hidden="true"
    >
      {/* Image placeholder */}
      <div className="h-64 shimmer" />

      {/* Body */}
      <div className="flex flex-col gap-2 p-4">
        {/* Vendor */}
        <div className="h-3 w-1/3 rounded-full shimmer" />
        {/* Title */}
        <div className="h-4 w-full rounded shimmer" />
        <div className="h-4 w-3/4 rounded shimmer" />
        {/* Stars */}
        <div className="h-3 w-2/5 rounded-full shimmer" />
        {/* Price */}
        <div className="mt-2 h-5 w-1/3 rounded shimmer" />
      </div>
    </div>
  );
}

/** Grid of N skeletons — use as Suspense fallback for product grids. */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
