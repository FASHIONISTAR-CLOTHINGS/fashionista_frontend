/**
 * @file loading.tsx (Collection detail — [slug])
 */
import { CardGridSkeleton } from "@/shared/components/skeletons";

export default function CollectionDetailLoading() {
  return (
    <div className="space-y-6" aria-label="Loading collection" aria-busy="true">
      <div className="h-48 w-full rounded-2xl bg-muted shimmer" />
      <div className="h-8 w-48 rounded bg-muted shimmer" />
      <div className="h-5 w-full max-w-prose rounded bg-muted shimmer" />
      <CardGridSkeleton count={8} />
    </div>
  );
}
