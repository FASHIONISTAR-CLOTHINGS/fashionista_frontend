/**
 * @file loading.tsx (Vendor Settings)
 * @description Vendor settings page skeleton matching the settings section layout.
 */
import { FormSkeleton, ProfileSkeleton } from "@/components";

export default function VendorSettingsLoading() {
  return (
    <div className="space-y-6 max-w-3xl" aria-label="Loading settings" aria-busy="true">
      <div className="h-7 w-32 rounded bg-muted shimmer" />
      {/* Profile section */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div className="h-5 w-40 rounded bg-muted shimmer" />
        <ProfileSkeleton />
      </div>
      {/* Form sections */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <FormSkeleton fields={6} />
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <FormSkeleton fields={3} />
      </div>
    </div>
  );
}
