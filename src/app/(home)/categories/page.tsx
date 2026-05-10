import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductGridSkeleton } from "@/features/product";
import CatalogPageClient from "./CatalogPageClient";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Browse all product categories on FASHIONISTAR AI — African fashion, senator outfits, agbada, gowns, and more. AI-powered size recommendations.",
};

interface CategoriesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Categories route — PPR pattern.
 * Static metadata + Suspense shell; client grid hydrates from Ninja API.
 */
export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const resolved = await searchParams;
  const category = typeof resolved.category === "string" ? resolved.category : undefined;
  const brand = typeof resolved.brand === "string" ? resolved.brand : undefined;
  const search = typeof resolved.q === "string" ? resolved.q : undefined;
  const ordering = typeof resolved.ordering === "string" ? resolved.ordering : "-created_at";

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="bg-[hsl(var(--primary))] px-4 py-16 text-center md:px-8 lg:px-20">
        <p className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--accent))]">
          FASHIONISTAR AI
        </p>
        <h1 className="mt-2 font-bon_foyage text-4xl leading-tight text-white md:text-6xl">
          Explore Categories
        </h1>
        <p className="mt-3 text-sm text-white/70 md:text-base max-w-xl mx-auto">
          Curated African fashion across all categories — from senator suits to custom gowns.
          AI-powered measurements ensure your perfect fit.
        </p>
      </div>

      {/* Product grid */}
      <section className="px-4 py-10 md:px-8 lg:px-20">
        <Suspense fallback={<ProductGridSkeleton count={12} />}>
          <CatalogPageClient
            category={category}
            brand={brand}
            search={search}
            ordering={ordering}
          />
        </Suspense>
      </section>
    </div>
  );
}
