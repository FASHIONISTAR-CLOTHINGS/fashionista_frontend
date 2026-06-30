import { Skeleton } from "@/components/ui/skeleton";

/** Auth card skeleton — mirrors the choose-role card layout */
export default function ChooseRoleLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 to-background p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl space-y-5">
        {/* Logo + heading */}
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-14 w-14 rounded-full" />
          <Skeleton className="h-7 w-48 mx-auto rounded" />
          <Skeleton className="h-4 w-64 mx-auto rounded" />
        </div>
        
        {/* Role options */}
        <div className="space-y-4 pt-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>

        {/* Submit */}
        <div className="pt-4">
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
