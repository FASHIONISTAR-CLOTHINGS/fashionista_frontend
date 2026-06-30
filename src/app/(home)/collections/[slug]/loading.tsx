import { Skeleton } from "@/components/ui/skeleton";

export default function CollectionDetailLoading() {
  return (
    <div className="bg-background text-foreground" aria-label="Loading collection" aria-busy="true">
      <section className="relative flex min-h-[320px] items-end overflow-hidden bg-[#01454A] md:min-h-[420px]">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 max-w-3xl space-y-4 px-5 py-12 md:px-10 lg:px-20">
          <div className="flex gap-2">
            <Skeleton className="h-4 w-14 bg-white/20" />
            <Skeleton className="h-4 w-4 bg-white/20" />
            <Skeleton className="h-4 w-24 bg-white/20" />
            <Skeleton className="h-4 w-4 bg-white/20" />
            <Skeleton className="h-4 w-28 bg-white/20" />
          </div>
          <Skeleton className="h-5 w-40 bg-[#fda600]/40" />
          <Skeleton className="h-16 w-72 bg-white/20 md:h-20 md:w-96" />
          <Skeleton className="h-5 w-full max-w-xl bg-white/15" />
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-12 w-32 rounded-full bg-[#fda600]/40" />
            <Skeleton className="h-12 w-36 rounded-full bg-white/15" />
          </div>
        </div>
      </section>

      <section className="border-b border-border px-5 py-6 md:px-10 lg:px-20">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-24 rounded-full" />
          ))}
        </div>
      </section>

      <section className="px-5 py-10 md:px-10 lg:px-20">
        <div className="mb-6">
          <Skeleton className="h-10 w-72" />
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
          <Skeleton className="h-10 w-52" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
              <Skeleton className="h-48 w-full" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-40" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
