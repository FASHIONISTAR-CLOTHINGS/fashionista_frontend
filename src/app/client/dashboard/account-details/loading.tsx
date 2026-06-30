import { FormSkeleton, ProfileSkeleton } from "@/components";

export default function ClientAccountDetailsLoading() {
  return (
    <div className="space-y-6" aria-label="Loading account details" aria-busy="true">
      <ProfileSkeleton />
      <div className="rounded-2xl border border-border bg-card p-6">
        <FormSkeleton fields={6} />
      </div>
    </div>
  );
}
