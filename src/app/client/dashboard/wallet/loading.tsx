/**
 * @file loading.tsx (Client Wallet)
 */
import { StatSkeleton, TableRowSkeleton } from "@/shared/components/skeletons";

export default function ClientWalletLoading() {
  return (
    <div className="space-y-5" aria-label="Loading wallet" aria-busy="true">
      <div className="h-7 w-24 rounded bg-muted shimmer" />
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="h-4 w-28 rounded bg-muted shimmer" />
        <div className="h-12 w-48 rounded bg-muted shimmer" />
        <div className="flex gap-3">
          <div className="h-10 w-32 rounded-xl bg-muted shimmer" />
          <div className="h-10 w-32 rounded-xl bg-muted shimmer" />
        </div>
      </div>
      <StatSkeleton count={3} />
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <TableRowSkeleton columns={4} rows={6} />
      </div>
    </div>
  );
}
