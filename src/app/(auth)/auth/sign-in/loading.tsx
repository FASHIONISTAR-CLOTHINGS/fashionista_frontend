import { Skeleton } from "@/components/ui/skeleton";

/** Auth card skeleton — mirrors the sign-in card layout */
export default function SignInLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 to-background p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl space-y-5">
        {/* Logo + heading */}
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-14 w-14 rounded-full" />
          <Skeleton className="h-7 w-48 mx-auto rounded" />
          <Skeleton className="h-4 w-64 mx-auto rounded" />
        </div>
        {/* Google btn */}
        <Skeleton className="h-11 w-full rounded-xl" />
        {/* Divider */}
        <Skeleton className="h-3 w-full rounded" />
        {/* Fields */}
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
        {/* Submit */}
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}
