/**
 * @file loading.tsx (Admin Support)
 * @description Admin support ticket queue skeleton.
 */
import { TableRowSkeleton, StatSkeleton } from "@/shared/components/skeletons";

export default function AdminSupportLoading() {
  return (
    <div className="space-y-5" aria-label="Loading support tickets" aria-busy="true">
      <div className="flex items-center justify-between">
        <div className="h-7 w-40 rounded bg-muted shimmer" />
        <div className="h-9 w-28 rounded-xl bg-muted shimmer" />
      </div>
      <StatSkeleton count={4} />
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <TableRowSkeleton columns={6} rows={8} />
      </div>
    </div>
  );
}
