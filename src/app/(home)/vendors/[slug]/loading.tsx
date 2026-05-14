/**
 * @file loading.tsx (Vendor profile — [slug])
 */
import { Skeleton } from "@/components/ui/skeleton";

export default function VendorProfileLoading() {
  return (
    <div className="bg-background text-foreground" aria-label="Loading vendor profile" aria-busy="true">
      <section className="relative flex min-h-[320px] items-end overflow-hidden bg-[#01454A] md:min-h-[400px]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#01454A] via-[#01454A]/80 to-[#fda600]/20" />
        <div className="relative z-10 w-full space-y-6 px-5 py-12 md:px-10 lg:px-20">
          <div className="flex gap-2">
            <Skeleton className="h-4 w-14 bg-white/20" />
            <Skeleton className="h-4 w-4 bg-white/20" />
            <Skeleton className="h-4 w-20 bg-white/20" />
            <Skeleton className="h-4 w-4 bg-white/20" />
            <Skeleton className="h-4 w-28 bg-white/20" />
          </div>
          <div className="flex flex-col gap-6 md:flex-row md:items-end">
            <Skeleton className="h-24 w-24 shrink-0 rounded-2xl border-4 border-[#fda600] bg-white/20 md:h-32 md:w-32" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-12 w-64 bg-white/20 md:h-16 md:w-80" />
              <Skeleton className="h-5 w-full max-w-xl bg-white/15" />
              <Skeleton className="h-9 w-36 rounded-full bg-white/15" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-12 w-40 rounded-full bg-[#fda600]/40" />
              <Skeleton className="h-12 w-40 rounded-full bg-white/15" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-[#F8F9FC] px-5 py-4 md:px-10 lg:px-20">
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="ml-auto h-4 w-28" />
        </div>
      </section>

      <section className="px-5 py-10 md:px-10 lg:px-20">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-24" />
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
    </div>
  );
}
