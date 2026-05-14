import { FormSkeleton } from "@/shared/components/skeletons";

export default function NewCollectionLoading() {
  return (
    <div className="space-y-6" aria-label="Loading new collection form" aria-busy="true">
      <div className="h-10 w-64 rounded bg-muted shimmer" />
      <div className="rounded-2xl border border-border bg-card p-6">
        <FormSkeleton fields={7} />
      </div>
    </div>
  );
}
