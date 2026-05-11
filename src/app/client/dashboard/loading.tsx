/**
 * @file loading.tsx (Client Dashboard)
 * @description Page-specific skeleton matching the client dashboard layout:
 * profile card + stat summary + recent orders + loyalty widget.
 */
import {
  ProfileSkeleton,
  StatSkeleton,
  TableRowSkeleton,
} from "@/shared/components/skeletons";

export default function ClientDashboardLoading() {
  return (
    <div className="space-y-6" aria-label="Loading dashboard" aria-busy="true">
      {/* Welcome banner */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <ProfileSkeleton />
      </div>

      {/* Summary stats */}
      <StatSkeleton count={4} />

      {/* Split: orders + loyalty */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="h-5 w-32 rounded bg-muted shimmer" />
          </div>
          <TableRowSkeleton columns={4} rows={5} />
        </div>
        {/* Loyalty widget placeholder */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="h-5 w-36 rounded bg-muted shimmer" />
          <div className="h-10 w-32 rounded bg-muted shimmer" />
          <div className="h-3 w-full rounded-full bg-muted shimmer" />
          <div className="h-3 w-3/4 rounded bg-muted shimmer" />
        </div>
      </div>
    </div>
  );
}
