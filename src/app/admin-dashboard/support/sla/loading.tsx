import { StatSkeleton, TableRowSkeleton } from "@/components";

export default function SlaMonitoringLoading() {
  return (
    <div className="space-y-6" aria-label="Loading SLA dashboard" aria-busy="true">
      <StatSkeleton count={4} />
      <div className="rounded-2xl border border-border bg-card p-4">
        <TableRowSkeleton columns={5} rows={8} />
      </div>
    </div>
  );
}
