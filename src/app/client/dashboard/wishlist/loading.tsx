/**
 * @file loading.tsx (Client Wishlist)
 */
import { CardGridSkeleton } from "@/components";

export default function WishlistDashboardLoading() {
  return (
    <div className="space-y-5" aria-label="Loading wishlist" aria-busy="true">
      <div className="flex items-center justify-between">
        <div className="h-7 w-28 rounded bg-muted shimmer" />
        <div className="h-4 w-20 rounded bg-muted shimmer" />
      </div>
      <CardGridSkeleton count={6} />
    </div>
  );
}
