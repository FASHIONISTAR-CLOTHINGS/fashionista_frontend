/**
 * @file loading.tsx (Client Transactions)
 */
import { StatSkeleton, TableRowSkeleton } from "@/components";

export default function ClientTransactionsLoading() {
  return (
    <div className="space-y-5" aria-label="Loading transactions" aria-busy="true">
      <div className="h-7 w-36 rounded bg-muted shimmer" />
      <StatSkeleton count={3} />
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <TableRowSkeleton columns={5} rows={7} />
      </div>
    </div>
  );
}
