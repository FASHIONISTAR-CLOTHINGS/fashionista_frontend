/**
 * @file collections/page.tsx
 * @description Fashionistar Collections listing page — Phase 4/5 overhaul.
 *
 * Fixes:
 *   - URL-driven pagination via FashionistarPagination (SSR-safe)
 *   - Mobile layout: hero text clamped, grid responsive, CTA touch-target
 *   - CatalogCollectionGrid receives page from searchParams
 *   - Mobile filter nav overflow fixed inside component
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CatalogCollectionGrid } from "@/features/catalog";
import { getCatalogCollections } from "@/features/catalog";
import { FashionistarPagination } from "@/components/ui/FashionistarPagination";

export const metadata: Metadata = {
  title: "Fashion Collections | Fashionistar",
  description:
    "Explore curated fashion collections on Fashionistar — seasonally updated African and Nigerian fashion bundles for every occasion, style, and budget.",
  alternates: { canonical: "/collections" },
  openGraph: {
    title: "Fashion Collections | Fashionistar",
    description:
      "Handpicked African fashion collections — bespoke outfits, seasonal looks, and AI-measured fits for every occasion.",
    url: "/collections",
    type: "website",
  },
};

const COLLECTIONS_PAGE_SIZE = 12;

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────────────────

function CollectionsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden border border-border/30 animate-pulse">
          <div className="aspect-[4/3] w-full bg-muted/50" />
          <div className="p-4 space-y-2">
            <div className="h-4 w-3/4 rounded bg-muted/50" />
            <div className="h-3 w-1/2 rounded bg-muted/30" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Paginated Collections RSC
// ─────────────────────────────────────────────────────────────────────────────

async function PaginatedCollections({
  page,
  searchParams,
}: {
  page: number;
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const allCollections = await getCatalogCollections();
  const totalCount = allCollections.length;
  const start = (page - 1) * COLLECTIONS_PAGE_SIZE;
  const pageCollections = allCollections.slice(start, start + COLLECTIONS_PAGE_SIZE);

  return (
    <div className="space-y-10">
      <CatalogCollectionGrid
        collections={pageCollections}
        searchParams={searchParams}
        showCta={false}
      />
      {totalCount > COLLECTIONS_PAGE_SIZE && (
        <FashionistarPagination
          currentPage={page}
          totalCount={totalCount}
          pageSize={COLLECTIONS_PAGE_SIZE}
          baseHref="/collections"
          className="pt-4 pb-8"
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

interface CollectionsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CollectionsPage({ searchParams }: CollectionsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(String(params.page ?? "1"), 10) || 1);

  return (
    <main className="bg-background text-foreground">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#01454A] via-[#01454A] to-[#012e31] px-4 py-16 md:py-20 md:px-8 lg:px-20">
        {/* Decorative blobs */}
        <div
          aria-hidden="true"
          className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-[#fda600]/10 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-1/2 h-48 w-48 rounded-full bg-white/5 blur-3xl pointer-events-none"
        />

        <div className="relative max-w-3xl">
          <p className="font-raleway text-xs font-bold uppercase tracking-[0.25em] text-[#fda600] mb-4">
            Curated Looks
          </p>
          {/* MOBILE FIX: clamp hero text to prevent overflow at 375px */}
          <h1 className="font-bon_foyage text-[clamp(2.5rem,7vw,5.5rem)] leading-none text-white">
            Fashion Collections
          </h1>
          <p className="mt-5 max-w-2xl font-raleway text-base leading-7 text-white/70">
            Seasonally updated curations of the finest Nigerian and African fashion. Every
            collection is handpicked by our style team and AI-matched to your measurements for a
            guaranteed perfect fit.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="touch-target inline-flex items-center gap-2 rounded-full bg-[#fda600] px-7 py-3 font-raleway text-sm font-bold text-black shadow-lg hover:bg-[#e09500] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
            >
              Shop All Products
            </Link>
            <Link
              href="/categories"
              className="touch-target inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3 font-raleway text-sm font-medium text-white backdrop-blur-sm hover:bg-white/10 transition-all duration-200"
            >
              Browse Categories
            </Link>
          </div>
        </div>
      </section>

      {/* ── Collections Grid ───────────────────────────────────────────────── */}
      <section className="px-4 py-12 md:px-8 lg:px-20">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-raleway text-xs font-semibold uppercase tracking-widest text-[#fda600] mb-1">
              Season Drops
            </p>
            <h2 className="font-bon_foyage text-3xl text-foreground md:text-4xl">
              All Collections
            </h2>
          </div>
          <Link
            href="/brands"
            className="font-raleway text-sm font-medium text-[#01454A] underline-offset-4 hover:underline transition-colors dark:text-[#fda600]"
          >
            Browse Brands →
          </Link>
        </div>

        <Suspense fallback={<CollectionsSkeleton />}>
          <PaginatedCollections page={page} searchParams={params} />
        </Suspense>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#0D0D0D] px-4 py-16 md:px-8 lg:px-20">
        <div className="max-w-2xl mx-auto text-center space-y-5">
          <p className="font-raleway text-sm font-semibold uppercase tracking-widest text-[#fda600]">
            AI-Powered Fashion
          </p>
          <h2 className="font-bon_foyage text-3xl text-white md:text-5xl">
            Your Perfect Fit, Every Time
          </h2>
          <p className="font-raleway text-base text-white/70 leading-7">
            Take your digital measurements in 60 seconds. Our AI matches you to the right size
            across every brand and collection on Fashionistar.
          </p>
          <Link
            href="/get-measured"
            className="touch-target inline-block rounded-full bg-[#fda600] px-10 py-3.5 font-raleway text-sm font-bold text-black shadow-lg hover:bg-[#e09500] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          >
            Get Measured Free
          </Link>
        </div>
      </section>
    </main>
  );
}
