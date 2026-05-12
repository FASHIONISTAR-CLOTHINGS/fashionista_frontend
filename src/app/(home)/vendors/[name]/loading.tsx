/**
 * @file loading.tsx (Vendor profile — [name])
 */
import { CardGridSkeleton } from "@/shared/components/skeletons";

export default function VendorProfileLoading() {
  return (
    <div className="space-y-6" aria-label="Loading vendor profile" aria-busy="true">
      {/* Cover banner */}
      <div className="h-48 w-full rounded-2xl bg-muted shimmer" />
      {/* Profile row */}
      <div className="flex items-end gap-4 -mt-10 px-4">
        <div className="h-24 w-24 rounded-2xl bg-muted shimmer border-4 border-background flex-shrink-0" />
        <div className="flex-1 space-y-2 pb-2">
          <div className="h-6 w-48 rounded bg-muted shimmer" />
          <div className="h-4 w-64 rounded bg-muted shimmer" />
        </div>
      </div>
      {/* Tab bar */}
      <div className="flex gap-4 border-b border-border">
        {["Products", "About", "Reviews"].map((t) => (
          <div key={t} className="h-5 w-20 rounded bg-muted shimmer mb-2" />
        ))}
      </div>
      <CardGridSkeleton count={8} />
    </div>
  );
}
