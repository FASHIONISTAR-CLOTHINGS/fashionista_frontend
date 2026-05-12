/**
 * @file loading.tsx (Vendor Setup / Onboarding)
 * @description Multi-step onboarding wizard skeleton.
 */
import { FormSkeleton } from "@/shared/components/skeletons";

export default function VendorSetupLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6" aria-label="Loading setup" aria-busy="true">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-muted shimmer" />
            {i < 4 && <div className="h-1 w-12 rounded bg-muted shimmer" />}
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div className="h-6 w-48 rounded bg-muted shimmer" />
        <div className="h-4 w-full max-w-prose rounded bg-muted shimmer" />
        <FormSkeleton fields={5} />
      </div>
      <div className="flex justify-between">
        <div className="h-10 w-24 rounded-xl bg-muted shimmer" />
        <div className="h-10 w-28 rounded-xl bg-muted shimmer" />
      </div>
    </div>
  );
}
