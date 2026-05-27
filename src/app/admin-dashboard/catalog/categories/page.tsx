/**
 * app/admin-dashboard/catalog/categories/page.tsx
 *
 * Server Component shell rendering the CategoriesDashboard client component.
 * Features strict Client-Server boundary isolation and URL state prefetching.
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import { CategoriesDashboard } from "@/features/catalog";
import { TableRowSkeleton } from "@/shared/components/skeletons";

export const metadata: Metadata = {
  title: "Categories — Fashionistar Admin",
  description: "Organize couture lines, premium custom apparel, and catalog taxonomies.",
};

export default function CategoriesPage() {
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
        <CategoriesDashboard />
      </Suspense>
    </section>
  );
}
