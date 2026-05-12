import { Skeleton } from "@/components/shared/ui/Skeleton";

/** Auth card skeleton — mirrors the sign-in card layout */
export default function SignInLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 to-background p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl space-y-5">
        {/* Logo + heading */}
        <div className="flex flex-col items-center gap-3">
          <Skeleton variant="circular" className="h-14 w-14" />
          <Skeleton variant="text" className="h-7 w-48 mx-auto" />
          <Skeleton variant="text" className="h-4 w-64 mx-auto" />
        </div>
        {/* Google btn */}
        <Skeleton variant="rectangular" className="h-11 w-full rounded-xl" />
        {/* Divider */}
        <Skeleton variant="text" className="h-3 w-full" />
        {/* Fields */}
        <Skeleton variant="rectangular" className="h-11 w-full rounded-xl" />
        <Skeleton variant="rectangular" className="h-11 w-full rounded-xl" />
        {/* Submit */}
        <Skeleton variant="rectangular" className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}
