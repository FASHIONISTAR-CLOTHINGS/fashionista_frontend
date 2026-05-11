/**
 * @file loading.tsx (Vendor KYC)
 * @description Vendor KYC verification page skeleton.
 */
import { FormSkeleton } from "@/shared/components/skeletons";

export default function VendorKycLoading() {
  return (
    <div className="space-y-5 max-w-2xl" aria-label="Loading KYC verification" aria-busy="true">
      <div className="h-7 w-36 rounded bg-muted shimmer" />
      <div className="h-4 w-full max-w-md rounded bg-muted shimmer" />
      {/* Status indicator */}
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
