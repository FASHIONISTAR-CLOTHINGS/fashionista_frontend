/**
 * @file brands/page.tsx
 * @description Fashionistar Brands listing page — Wave 8 + Phase 4/5 overhaul.
 *
 * Fixes (Phase 2, 4, 5):
 *   - FashionistarImage used correctly with fill + explicit parent h-20
 *   - Mobile hero text clamped (text-4xl on small, not 8xl)
 *   - BrandGrid accepts page from searchParams → URL-driven pagination
 *   - FashionistarPagination rendered below grid (SSR-compatible)
 *   - Grid gap-3 on mobile (gap-4 on md+) prevents horizontal overflow at 375px
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getCatalogBrands } from "@/features/catalog";
import { FashionistarImage } from "@/components/media";
import { FashionistarPagination } from "@/components/ui/FashionistarPagination";

// ── SEO ───────────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Fashion Brands | Fashionistar",
  description:
    "Explore curated Nigerian and African fashion brands on Fashionistar — the AI-powered platform for bespoke fashion commerce. Browse vetted artisans and designers.",
  alternates: { canonical: "/brands" },
  openGraph: {
    title: "Fashion Brands | Fashionistar",
    description:
      "Discover premium Nigerian and African fashion brands — AI-powered measurements, secure payments, zero commissions.",
    url: "/brands",
    type: "website",
  },
};

const BRANDS_PAGE_SIZE = 20;

// ─────────────────────────────────────────────────────────────────────────────
// Shimmer Skeleton
// ─────────────────────────────────────────────────────────────────────────────

function BrandsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center rounded-2xl border border-border/30 bg-card p-4 space-y-3 animate-pulse"
        >
          <div className="h-20 w-full rounded-xl bg-muted/50" />
          <div className="h-3 w-24 rounded bg-muted/50" />
          <div className="h-2 w-16 rounded bg-muted/30" />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Brand Grid (async RSC — paginated)
// ─────────────────────────────────────────────────────────────────────────────

async function BrandGrid({ page }: { page: number }) {
  let allBrands: Awaited<ReturnType<typeof getCatalogBrands>> = [];
  try {
    allBrands = await getCatalogBrands();
  } catch {
    allBrands = [];
  }

  const totalCount = allBrands.length;
  const start = (page - 1) * BRANDS_PAGE_SIZE;
  const brands = allBrands.slice(start, start + BRANDS_PAGE_SIZE);

  if (allBrands.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="mb-4 text-6xl">🏷️</div>
        <h2 className="font-bon_foyage text-2xl text-foreground mb-2">Brands Coming Soon</h2>
        <p className="text-muted-foreground font-raleway text-sm max-w-sm">
          We are onboarding exclusive Nigerian and African fashion brands. Check back soon.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#fda600] px-8 py-3 font-raleway text-sm font-bold text-black shadow-lg hover:bg-[#e09500] transition-all duration-200 hover:-translate-y-0.5"
        >
          Browse All Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/brands/${brand.slug}`}
            className="group flex flex-col items-center rounded-2xl border border-border/40 bg-card p-3 md:p-5 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-[#fda600]/40 transition-all duration-300"
          >
            {/* Brand Logo — fixed-height container so FashionistarImage fill works */}
            <div className="relative h-20 w-full mb-3 rounded-xl overflow-hidden bg-muted/20">
              <FashionistarImage
                src={brand.image_url || brand.image || null}
                alt={brand.title}
                fill
                transformation="thumbnail"
                objectFit="contain"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                imgClassName="p-2 group-hover:scale-105 transition-transform duration-300"
                showBlurUp={false}
              />
              {/* Fallback monogram rendered by FashionistarImage placeholder — handled internally */}
            </div>

            {/* Brand name */}
            <h2 className="font-raleway font-bold text-xs md:text-sm text-foreground text-center leading-tight group-hover:text-[#01454A] transition-colors duration-200">
              {brand.title}
            </h2>
            {brand.description && (
              <p className="mt-1 font-raleway text-[10px] md:text-xs text-muted-foreground text-center line-clamp-2 leading-4">
                {brand.description}
              </p>
            )}

            {/* CTA indicator */}
            <span className="mt-2 text-[9px] md:text-[10px] font-semibold uppercase tracking-widest text-[#fda600] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              View Brand →
            </span>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalCount > BRANDS_PAGE_SIZE && (
        <FashionistarPagination
          currentPage={page}
          totalCount={totalCount}
          pageSize={BRANDS_PAGE_SIZE}
          baseHref="/brands"
          className="pt-4"
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

interface BrandsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BrandsPage({ searchParams }: BrandsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(String(params.page ?? "1"), 10) || 1);

  return (
    <main className="bg-background text-foreground">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0D0D0D] px-4 py-16 md:py-20 md:px-8 lg:px-20">
        {/* Decorative blobs */}
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#fda600]/10 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-[#01454A]/20 blur-3xl pointer-events-none"
        />

        <div className="relative max-w-3xl">
          <p className="font-raleway text-xs font-bold uppercase tracking-[0.25em] text-[#fda600] mb-4">
            Discover
          </p>
          {/* MOBILE FIX: clamp hero text — was text-8xl at lg which overflows on 375px */}
          <h1 className="font-bon_foyage text-[clamp(2.5rem,8vw,7rem)] leading-none text-white">
            Fashion Brands
          </h1>
          <p className="mt-5 max-w-2xl font-raleway text-base leading-7 text-white/70">
            Browse our curated network of Nigerian and African fashion brands. Every brand on
            Fashionistar is vetted for quality, authenticity, and craftsmanship — powered by AI
            measurements for your perfect fit.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="touch-target inline-flex items-center gap-2 rounded-full bg-[#fda600] px-7 py-3 font-raleway text-sm font-bold text-black shadow-lg hover:bg-[#e09500] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
            >
              Shop All Products
            </Link>
            <Link
              href="/collections"
              className="touch-target inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3 font-raleway text-sm font-medium text-white backdrop-blur-sm hover:bg-white/10 transition-all duration-200"
            >
              View Collections
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ──────────────────────────────────────────────────── */}
      <section className="border-b border-border/40 bg-card/60 px-4 py-6 md:px-8 lg:px-20">
        <div className="mx-auto flex max-w-screen-xl flex-wrap justify-center gap-8 md:justify-start">
          {[
            { value: "200+", label: "Vetted Brands" },
            { value: "5,000+", label: "Products" },
            { value: "100K+", label: "Happy Customers" },
            { value: "AI-First", label: "Platform" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="font-bon_foyage text-2xl font-bold text-[#fda600]">{value}</p>
              <p className="font-raleway text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Brand Grid ───────────────────────────────────────────────────── */}
      <section className="px-4 py-12 md:px-8 lg:px-20">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-raleway text-xs font-semibold uppercase tracking-widest text-[#fda600] mb-1">
              Our Network
            </p>
            <h2 className="font-bon_foyage text-3xl text-foreground md:text-4xl">All Brands</h2>
          </div>
          <Link
            href="/vendors"
            className="font-raleway text-sm font-medium text-[#01454A] underline-offset-4 hover:underline transition-colors dark:text-[#fda600]"
          >
            Become a Vendor →
          </Link>
        </div>

        <Suspense fallback={<BrandsSkeleton />}>
          <BrandGrid page={page} />
        </Suspense>
      </section>

      {/* ── Vendor CTA ───────────────────────────────────────────────────── */}
      <section className="bg-[#01454A] px-4 py-16 md:px-8 lg:px-20">
        <div className="max-w-2xl mx-auto text-center space-y-5">
          <p className="font-raleway text-sm font-semibold uppercase tracking-widest text-[#fda600]">
            Grow Your Brand
          </p>
          <h2 className="font-bon_foyage text-3xl text-white md:text-5xl">
            List Your Brand on Fashionistar
          </h2>
          <p className="font-raleway text-base text-white/70 leading-7">
            Join 200+ vetted Nigerian and African fashion brands reaching thousands of
            style-conscious clients daily. Zero commissions on your first 6 months.
          </p>
          <Link
            href="/auth/sign-up?role=vendor"
            className="touch-target inline-block rounded-full bg-[#fda600] px-10 py-3.5 font-raleway text-sm font-bold text-black shadow-lg hover:bg-[#e09500] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          >
            Apply to Sell
          </Link>
        </div>
      </section>
    </main>
  );
}
