/**
 * @file loading.tsx (Client KYC)
 */
import { FormSkeleton } from "@/components";

export default function ClientKycLoading() {
  return (
    <div className="space-y-5 max-w-2xl" aria-label="Loading KYC" aria-busy="true">
      <div className="h-7 w-40 rounded bg-muted shimmer" />
      <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-muted shimmer flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-32 rounded bg-muted shimmer" />
          <div className="h-3 w-48 rounded bg-muted shimmer" />
        </div>
        <div className="h-7 w-20 rounded-full bg-muted shimmer" />
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <FormSkeleton fields={4} />
      </div>
    </div>
  );
}
