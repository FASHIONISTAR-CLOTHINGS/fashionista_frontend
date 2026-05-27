/**
 * app/admin-dashboard/catalog/collections/page.tsx
 *
 * Server Component shell rendering the CollectionsDashboard client component.
 * Features strict Client-Server boundary isolation and URL state prefetching.
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import { CollectionsDashboard } from "@/features/admin-dashboard";
import { TableRowSkeleton } from "@/shared/components/skeletons";

export const metadata: Metadata = {
  title: "Collections — Fashionistar Admin",
  description: "Curate seasonal collections, design capsule releases and spotlight lines.",
};

export default function CollectionsPage() {
  return (
    <section className="min-h-screen space-y-4 px-1 py-2 bg-inherit">
      <Suspense fallback={
        <div className="space-y-8 bg-inherit">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white/40 backdrop-blur-md rounded-[24px] border border-white/20 shadow-sm animate-pulse">
            <div className="h-10 w-48 bg-gray-200 rounded" />
            <div className="h-10 w-32 bg-gray-200 rounded" />
          </div>
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#e5e5e5]">
            <TableRowSkeleton columns={5} rows={6} />
          </div>
        </div>
      }>
        <CollectionsDashboard />
      </Suspense>
    </section>
  );
}
