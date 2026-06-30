/**
 * @file loading.tsx (Client Payments)
 */
import { StatSkeleton, TableRowSkeleton } from "@/components";

export default function ClientPaymentsLoading() {
  return (
    <div className="space-y-5" aria-label="Loading payments" aria-busy="true">
      <div className="h-7 w-32 rounded bg-muted shimmer" />
      <StatSkeleton count={3} />
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <TableRowSkeleton columns={4} rows={6} />
      </div>
    </div>
  );
}
