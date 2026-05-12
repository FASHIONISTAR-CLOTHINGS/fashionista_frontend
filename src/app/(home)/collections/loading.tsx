/**
 * @file loading.tsx (Collections listing)
 */
import { CardGridSkeleton } from "@/shared/components/skeletons";

export default function CollectionsLoading() {
  return (
    <div className="space-y-6" aria-label="Loading collections" aria-busy="true">
      <div className="h-8 w-40 rounded bg-muted shimmer" />
      <CardGridSkeleton count={6} />
    </div>
  );
}
