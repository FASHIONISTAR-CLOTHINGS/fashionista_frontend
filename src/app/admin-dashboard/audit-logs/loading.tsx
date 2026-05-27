/**
 * @file loading.tsx (Admin Audit Logs)
 */
import { TableRowSkeleton } from "@/shared/components/skeletons";

export default function AdminAuditLoading() {
  return (
    <div className="space-y-5" aria-label="Loading audit logs" aria-busy="true">
      <div className="flex items-center justify-between">
        <div className="h-7 w-36 rounded bg-muted shimmer" />
        <div className="flex gap-2">
          <div className="h-9 w-32 rounded-xl bg-muted shimmer" />
          <div className="h-9 w-24 rounded-xl bg-muted shimmer" />
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <TableRowSkeleton columns={6} rows={12} />
      </div>
    </div>
  );
}
