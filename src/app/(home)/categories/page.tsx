/**
 * app/(home)/categories/page.tsx
 *
 * Categories listing page — shows the full grid of all product categories.
 * On clicking a category tile, users navigate to /categories/[slug] which
 * displays the products belonging to that category.
 *
 * Architecture:
 *   - RSC: getCatalogCategories() fetched server-side (ISR revalidate 60s)
 *   - CatalogCategoryGrid handles the tile grid (identical style to homepage section)
 *   - No product grid here — only category tiles
 */
import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogCategoryGrid, CatalogCategoryGridSkeleton } from "@/features/catalog";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shop by Category | Fashionistar",
  description:
    "Browse all fashion categories on FASHIONISTAR AI — African print, senator outfits, Agbada, luxury gowns, and more. AI-powered size recommendations.",
  alternates: { canonical: "/categories" },
  openGraph: {
    title: "Shop by Category | Fashionistar",
    description:
      "Explore curated African fashion categories — from senator suits to custom gowns. AI-powered measurements ensure your perfect fit.",
    url: "/categories",
    type: "website",
  },
};

/**
 * Categories listing page — RSC pattern.
 * Shows all category tiles. Click → /categories/[slug] → products for that category.
 */
export default async function CategoriesPage() {
  return (
    <div className="min-h-screen bg-background">

      {/* ── Page Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#01454A] via-[#01454A] to-[#012e31] px-4 py-16 md:py-20 md:px-8 lg:px-20">
        {/* Decorative blobs */}
        <div
          aria-hidden="true"
          className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-[#FDA600]/10 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-white/5 blur-3xl pointer-events-none"
        />

        <div className="relative max-w-3xl">
          <p className="font-raleway text-xs font-bold uppercase tracking-[0.25em] text-[#FDA600] mb-4">
            Shop by Category
          </p>
          <h1 className="font-bon_foyage text-[clamp(2.5rem,7vw,5.5rem)] leading-none text-white">
            All Categories
          </h1>
          <p className="mt-5 max-w-2xl font-raleway text-base leading-7 text-white/70">
            Explore every fashion domain on Fashionistar — from African print ready-to-wear to
            luxury hand-stitched bridal gowns. Click any category to browse its products.
          </p>
        </div>
      </section>

      {/* ── Category Grid ─────────────────────────────────────────────────── */}
      <section className="px-4 py-12 md:px-8 lg:px-20">
        <Suspense fallback={<CatalogCategoryGridSkeleton count={12} />}>
          <CatalogCategoryGrid showCta={false} />
        </Suspense>
      </section>

    </div>
  );
}
