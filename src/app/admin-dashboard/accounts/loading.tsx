import { Skeleton } from "@/components/shared/ui/Skeleton";

/** Admin sub-page loading skeleton — matches the wide table layout */
export default function AdminSubPageLoading() {
  return (
    <div className="w-full space-y-6 p-6 pt-[140px]">
      {/* Page heading */}
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="h-8 w-48" />
        <Skeleton variant="rectangular" className="h-10 w-32 rounded-lg" />
      </div>
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" className="h-24 rounded-xl" />
        ))}
      </div>
      {/* Table skeleton */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="bg-muted/40 px-4 py-3 flex gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="text" className="h-4 flex-1" />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3 border-t border-border">
            <Skeleton variant="circular" className="h-8 w-8 flex-shrink-0" />
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} variant="text" className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
      {/* Pagination */}
      <div className="flex justify-end gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" className="h-9 w-9 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
