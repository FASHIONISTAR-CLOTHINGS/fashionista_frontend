/**
 * @file loading.tsx (Admin Dashboard)
 * @description Admin dashboard page-specific skeleton.
 */
import { StatSkeleton, TableRowSkeleton } from "@/components";

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-6" aria-label="Loading admin dashboard" aria-busy="true">
      <div className="h-7 w-44 rounded bg-muted shimmer" />
      <StatSkeleton count={6} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <div className="h-5 w-36 rounded bg-muted shimmer" />
          <TableRowSkeleton columns={4} rows={5} />
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <div className="h-5 w-32 rounded bg-muted shimmer" />
          <div className="h-52 w-full rounded-xl bg-muted shimmer" />
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="h-5 w-36 rounded bg-muted shimmer" />
        </div>
        <TableRowSkeleton columns={6} rows={6} />
      </div>
    </div>
  );
}
