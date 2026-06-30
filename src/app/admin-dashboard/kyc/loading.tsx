/**
 * @file loading.tsx (Admin KYC)
 */
import { TableRowSkeleton, StatSkeleton } from "@/components";

export default function AdminKycLoading() {
  return (
    <div className="space-y-5" aria-label="Loading KYC reviews" aria-busy="true">
      <div className="h-7 w-40 rounded bg-muted shimmer" />
      <StatSkeleton count={4} />
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <TableRowSkeleton columns={7} rows={8} />
      </div>
    </div>
  );
}
