/**
 * @file loading.tsx (Blog listing)
 */
import { CardGridSkeleton } from "@/components";

export default function BlogLoading() {
  return (
    <div className="space-y-6" aria-label="Loading blog" aria-busy="true">
      {/* Hero banner */}
      <div className="h-48 w-full rounded-2xl bg-muted shimmer" />
      <CardGridSkeleton count={6} />
    </div>
  );
}
