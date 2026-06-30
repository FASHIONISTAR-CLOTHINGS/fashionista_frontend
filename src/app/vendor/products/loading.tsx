/**
 * @file loading.tsx (Vendor Products)
 * @description Page-specific skeleton matching the vendor products catalog grid.
 */
import { CardGridSkeleton } from "@/components";

export default function VendorProductsLoading() {
  return (
    <div className="space-y-5" aria-label="Loading products" aria-busy="true">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-7 w-40 rounded bg-muted shimmer" />
        <div className="h-9 w-36 rounded-xl bg-muted shimmer" />
      </div>
      {/* Search + filter bar */}
      <div className="flex gap-3">
        <div className="h-10 flex-1 rounded-xl bg-muted shimmer" />
        <div className="h-10 w-24 rounded-xl bg-muted shimmer" />
      </div>
      {/* Product grid */}
      <CardGridSkeleton count={8} />
    </div>
  );
}
