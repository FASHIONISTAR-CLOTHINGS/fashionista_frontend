/**
 * @file loading.tsx (Vendor Product Catalog)
 */
import { CardGridSkeleton } from "@/shared/components/skeletons";

export default function VendorProductCatalogLoading() {
  return (
    <div className="space-y-5" aria-label="Loading product catalog" aria-busy="true">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="h-7 w-36 rounded bg-muted shimmer" />
        <div className="flex gap-2">
          <div className="h-9 w-24 rounded-xl bg-muted shimmer" />
          <div className="h-9 w-28 rounded-xl bg-muted shimmer" />
        </div>
      </div>
      <CardGridSkeleton count={8} />
    </div>
  );
}
