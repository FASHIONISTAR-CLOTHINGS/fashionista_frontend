/**
 * @file loading.tsx (Admin Orders)
 */
import { StatSkeleton, TableRowSkeleton } from "@/shared/components/skeletons";

export default function AdminOrdersLoading() {
  return (
    <div className="space-y-5" aria-label="Loading admin orders" aria-busy="true">
      <div className="flex items-center justify-between">
        <div className="h-7 w-32 rounded bg-muted shimmer" />
        <div className="h-9 w-28 rounded-xl bg-muted shimmer" />
      </div>
      <StatSkeleton count={4} />
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <TableRowSkeleton columns={7} rows={10} />
      </div>
    </div>
  );
}
