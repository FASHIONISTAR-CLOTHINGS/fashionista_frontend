/**
 * @file loading.tsx (Client Dashboard Orders)
 * @description Client order history page skeleton.
 */
import { TableRowSkeleton } from "@/components";

export default function ClientOrdersLoading() {
  return (
    <div className="space-y-5" aria-label="Loading orders" aria-busy="true">
      <div className="flex items-center justify-between">
        <div className="h-7 w-32 rounded bg-muted shimmer" />
        <div className="h-9 w-24 rounded-xl bg-muted shimmer" />
      </div>
      {/* Status filter pills */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-20 rounded-full bg-muted shimmer" />
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <TableRowSkeleton columns={5} rows={8} />
      </div>
    </div>
  );
}
