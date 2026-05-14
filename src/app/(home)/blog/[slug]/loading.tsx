import { Skeleton } from "@/components/ui/skeleton";

export default function BlogPostLoading() {
  return (
    <main
      className="bg-background px-5 py-10 text-foreground md:px-10 lg:px-20"
      aria-label="Loading article"
      aria-busy="true"
    >
      <article className="mx-auto max-w-4xl space-y-8">
        <Skeleton className="h-10 w-32 rounded-full" />

        <header className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-7 w-40 rounded-full" />
          </div>
          <Skeleton className="h-16 w-full max-w-3xl md:h-24" />
          <Skeleton className="h-6 w-full max-w-2xl" />
          <Skeleton className="h-5 w-40" />
        </header>

        <Skeleton className="h-[320px] w-full rounded-lg border border-border md:h-[520px]" />

        <div className="space-y-4">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-11/12" />
              <Skeleton className="h-5 w-4/5" />
            </div>
          ))}
        </div>
      </article>
    </main>
  );
}
