import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryDetailLoading() {
  return (
    <div className="bg-background text-foreground" aria-label="Loading category" aria-busy="true">
      <section className="relative flex min-h-[280px] items-end overflow-hidden bg-[#01454A] md:min-h-[360px]">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 w-full space-y-4 px-5 py-10 md:px-10 lg:px-20">
          <div className="flex gap-2">
            <Skeleton className="h-4 w-14 bg-white/20" />
            <Skeleton className="h-4 w-4 bg-white/20" />
            <Skeleton className="h-4 w-20 bg-white/20" />
            <Skeleton className="h-4 w-4 bg-white/20" />
            <Skeleton className="h-4 w-24 bg-white/20" />
          </div>
          <Skeleton className="h-16 w-72 bg-white/20 md:h-20 md:w-96" />
          <div className="flex gap-3 pt-1">
            <Skeleton className="h-12 w-32 rounded-full bg-[#fda600]/40" />
            <Skeleton className="h-12 w-36 rounded-full bg-white/15" />
          </div>
        </div>
      </section>

      <section className="border-b border-border px-5 py-5 md:px-10 lg:px-20">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-28 rounded-full" />
          ))}
        </div>
      </section>

      <section className="px-5 py-10 md:px-10 lg:px-20">
        <div className="mb-6">
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="space-y-3 rounded-2xl border border-border bg-card p-3">
              <Skeleton className="aspect-[4/5] w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#F8F9FC] px-5 py-12 md:px-10 lg:px-20">
        <div className="mb-6">
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-3 rounded-2xl border border-border bg-white p-4">
              <Skeleton className="mx-auto h-16 w-16 rounded-full" />
              <Skeleton className="mx-auto h-4 w-20" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
