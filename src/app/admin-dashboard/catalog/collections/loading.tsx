/**
 * @file loading.tsx (Admin Collections)
 */
import { CardGridSkeleton } from "@/components";

export default function AdminCollectionsLoading() {
  return (
    <div className="space-y-5" aria-label="Loading collections admin" aria-busy="true">
      <div className="flex items-center justify-between">
        <div className="h-7 w-36 rounded bg-muted shimmer" />
        <div className="h-9 w-32 rounded-xl bg-muted shimmer" />
      </div>
      <CardGridSkeleton count={6} />
    </div>
  );
}
