/**
 * @file loading.tsx (Category detail — [slug])
 */
import { CardGridSkeleton } from "@/shared/components/skeletons";

export default function CategoryDetailLoading() {
  return (
    <div className="space-y-6" aria-label="Loading category" aria-busy="true">
      <div className="h-36 w-full rounded-2xl bg-muted shimmer" />
      <div className="h-7 w-48 rounded bg-muted shimmer" />
      <CardGridSkeleton count={8} />
    </div>
  );
}
