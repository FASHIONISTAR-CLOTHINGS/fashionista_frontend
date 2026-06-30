import { Skeleton } from "@/components/ui/skeleton";

/** Auth card skeleton — mirrors the sign-up card layout */
export default function SignUpLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 to-background p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl space-y-5">
        {/* Logo + heading */}
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-14 w-14 rounded-full" />
          <Skeleton className="h-7 w-52 mx-auto rounded" />
          <Skeleton className="h-4 w-64 mx-auto rounded" />
        </div>
        {/* Role tabs */}
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
        </div>
        {/* Google btn */}
        <Skeleton className="h-11 w-full rounded-xl" />
        {/* Divider */}
        <Skeleton className="h-3 w-full rounded" />
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-11 rounded-xl" />
          <Skeleton className="h-11 rounded-xl" />
        </div>
        {/* Fields */}
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
        {/* Submit */}
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}
