"use client";

import { Suspense } from "react";
import { CategoriesDashboard } from "@/features/catalog";
import { TableRowSkeleton } from "@/shared/components/skeletons";

export default function CategoriesPage() {
  return (
    <Suspense fallback={
      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#e5e5e5] mt-8">
        <TableRowSkeleton columns={5} rows={6} />
      </div>
    }>
      <CategoriesDashboard />
    </Suspense>
  );
}
