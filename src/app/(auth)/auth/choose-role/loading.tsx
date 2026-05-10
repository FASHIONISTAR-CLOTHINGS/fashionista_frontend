import { Skeleton } from "@/components/shared/ui/Skeleton";

/** Choose-role loading skeleton */
export default function ChooseRoleLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 to-background p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-10 shadow-xl space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Skeleton variant="circular" className="h-16 w-16 mx-auto" />
          <Skeleton variant="text" className="h-8 w-60 mx-auto" />
          <Skeleton variant="text" className="h-4 w-80 mx-auto" />
        </div>
        {/* Role cards */}
        <div className="grid grid-cols-2 gap-4">
          <Skeleton variant="card" className="h-44 rounded-2xl" />
          <Skeleton variant="card" className="h-44 rounded-2xl" />
        </div>
        <Skeleton variant="rectangular" className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}
