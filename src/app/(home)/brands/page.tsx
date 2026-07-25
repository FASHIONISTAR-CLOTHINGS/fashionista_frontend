/**
 * @file brands/page.tsx
 * @description Fashionistar Brands listing — R18 editorial overhaul.
 *
 * Design: Two-tier layout:
 *   - Featured brands (is_featured/premium) → large 3-col editorial cards with banner
 *   - All brands → compact 2→3→4→5 col logo grid
 *
 * Funnel: Every brand card has dual CTA — "View Brand" + "Get Measured"
 * SEO: Organisation schema + Open Graph + canonical
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getCatalogBrands } from "@/features/catalog";
import { FashionistarImage } from "@/components/media";
import { FashionistarPagination } from "@/components/ui/FashionistarPagination";
import { BadgeCheck, Ruler, ExternalLink, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

// ── SEO ───────────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Fashion Brands | Fashionistar",
  description:
    "Explore 200+ curated Nigerian and African fashion brands on Fashionistar — the AI-powered platform for bespoke fashion commerce. Browse vetted artisans and designers.",
  alternates: { canonical: "/brands" },
  openGraph: {
    title: "Fashion Brands | Fashionistar",
    description:
      "Discover premium Nigerian and African fashion brands — AI-powered measurements, secure payments, zero commissions.",
    url: "/brands",
    type: "website",
  },
};

const BRANDS_PAGE_SIZE = 24;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

// CatalogBrand type — extended fields accessible via unknown cast for optional backend additions
type BrandRecord = {
  id: number | string;
  slug: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  image?: string | null;
  // Optional fields from enriched backend (may be present)
  [key: string]: unknown;
};

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────────────────

function BrandsSkeleton() {
  return (
    <div className="space-y-10">
      {/* Featured skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden border border-border/30 animate-pulse">
            <div className="h-40 w-full bg-muted/50" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 rounded bg-muted/50" />
              <div className="h-3 w-1/2 rounded bg-muted/30" />
            </div>
          </div>
        ))}
      </div>
      {/* Grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center rounded-2xl border border-border/30 bg-card p-4 space-y-3 animate-pulse">
            <div className="h-16 w-full rounded-xl bg-muted/50" />
            <div className="h-3 w-24 rounded bg-muted/50" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Featured Brand Card (editorial 3-col)
// ─────────────────────────────────────────────────────────────────────────────

function FeaturedBrandCard({ brand }: { brand: BrandRecord }) {
  const isVerified = !!(brand.verified || brand.is_verified);
  const isPremium = !!(brand.premium || brand.is_premium);
  const productCount = brand.cached_product_count as number | undefined;
  const estYear = brand.established_year as number | undefined;
  const bannerUrl = (brand.logo_banner || brand.banner_image || brand.image_url || brand.image) as string | null | undefined;

  return (
    <article className="group relative rounded-2xl border border-border/40 bg-card overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#FDA600]/30 transition-all duration-300">
      {/* Banner / Logo area */}
      <div className="relative h-36 bg-gradient-to-br from-[#01454A]/10 via-[#FDA600]/5 to-[#01454A]/5 overflow-hidden">
        {bannerUrl ? (
          <FashionistarImage
            src={bannerUrl}
            alt={`${brand.title} brand banner`}
            fill
            transformation="card"
            objectFit="cover"
            imgClassName="group-hover:scale-105 transition-transform duration-500"
            showBlurUp={false}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-bon_foyage text-5xl font-bold text-[#01454A]/20">
              {brand.title.charAt(0)}
            </span>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {isPremium && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FDA600] px-2 py-0.5 text-[9px] font-bold text-black uppercase tracking-wide shadow-sm">
              <Sparkles size={8} />
              Premium
            </span>
          )}
          {isVerified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#01454A] px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wide shadow-sm">
              <BadgeCheck size={8} />
              Verified
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-1.5 mb-1">
          <h2 className="font-raleway font-bold text-sm text-foreground group-hover:text-[#01454A] transition-colors">
            {brand.title}
          </h2>
          {isVerified && (
            <BadgeCheck size={13} className="text-[#01454A] flex-shrink-0" aria-label="Verified brand" />
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 mb-2">
          {productCount !== undefined && productCount > 0 && (
            <span className="text-[10px] text-muted-foreground font-medium">
              {productCount.toLocaleString()} products
            </span>
          )}
          {estYear && (
            <span className="text-[10px] text-muted-foreground">Est. {estYear}</span>
          )}
        </div>

        {brand.description && (
          <p className="font-raleway text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
            {brand.description}
          </p>
        )}

        {/* Dual CTA */}
        <div className="grid grid-cols-2 gap-2 mt-auto">
          <Link
            href={`/brands/${brand.slug}`}
            data-testid={`brand-card-visit-${brand.slug}`}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#01454A] px-3 py-2 text-[11px] font-bold text-white hover:bg-[#01353A] transition-colors duration-150"
          >
            <ExternalLink size={10} />
            View Brand
          </Link>
          <Link
            href={`/get-measured?brand=${brand.slug}`}
            data-testid={`brand-card-measure-${brand.slug}`}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#FDA600] px-3 py-2 text-[11px] font-bold text-black hover:bg-[#F0A000] transition-colors duration-150"
          >
            <Ruler size={10} />
            Get Measured
          </Link>
        </div>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Compact Brand Card (logo grid)
// ─────────────────────────────────────────────────────────────────────────────

function CompactBrandCard({ brand }: { brand: BrandRecord }) {
  const isVerified = !!(brand.verified || brand.is_verified);

  return (
    <Link
      href={`/brands/${brand.slug}`}
      data-testid={`brand-compact-${brand.slug}`}
      className="group flex flex-col items-center rounded-2xl border border-border/40 bg-card p-3 md:p-4 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-[#FDA600]/30 transition-all duration-300"
    >
      {/* Logo */}
      <div className="relative h-14 w-full mb-2 rounded-xl overflow-hidden bg-muted/20">
        <FashionistarImage
          src={(brand.image_url || brand.image) as string | null}
          alt={brand.title}
          fill
          transformation="thumbnail"
          objectFit="contain"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
          imgClassName="p-1.5 group-hover:scale-105 transition-transform duration-300"
          showBlurUp={false}
        />
      </div>

      {/* Name + badge */}
      <div className="flex items-center gap-1 justify-center">
        <h3 className="font-raleway font-bold text-[11px] md:text-xs text-foreground text-center leading-tight group-hover:text-[#01454A] transition-colors line-clamp-2">
          {brand.title}
        </h3>
        {isVerified && (
          <BadgeCheck size={10} className="text-[#01454A] flex-shrink-0" aria-label="Verified" />
        )}
      </div>

      {/* Hover CTA */}
      <span className="mt-1.5 text-[9px] font-bold uppercase tracking-widest text-[#FDA600] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        View →
      </span>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Brand Grid RSC (paginated)
// ─────────────────────────────────────────────────────────────────────────────

async function BrandGrid({ page }: { page: number }) {
  let allBrands: BrandRecord[] = [];
  try {
    const raw = await getCatalogBrands();
    allBrands = raw as unknown as BrandRecord[];
  } catch {
    allBrands = [];
  }

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
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#FDA600] px-8 py-3 font-raleway text-sm font-bold text-black shadow-lg hover:bg-[#F0A000] transition-all duration-200 hover:-translate-y-0.5"
        >
          Browse All Products
        </Link>
      </div>
    );
  }

  // Separate featured (premium/verified) from regular for two-tier layout
  const featuredBrands = allBrands.filter(
    (b) => b.premium || b.is_premium || b.is_featured,
  );
  const regularBrands = allBrands.filter(
    (b) => !b.premium && !b.is_premium && !b.is_featured,
  );

  const totalCount = regularBrands.length;
  const start = (page - 1) * BRANDS_PAGE_SIZE;
  const pageBrands = regularBrands.slice(start, start + BRANDS_PAGE_SIZE);

  return (
    <div className="space-y-12">
      {/* ── Featured brands editorial grid ────────────────────────────────── */}
      {featuredBrands.length > 0 && (
        <section aria-label="Featured brands">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#FDA600]">
              Featured
            </span>
            <div className="flex-1 h-px bg-border/30" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredBrands.slice(0, 6).map((brand) => (
              <FeaturedBrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        </section>
      )}

      {/* ── All brands compact grid ──────────────────────────────────────── */}
      {pageBrands.length > 0 && (
        <section aria-label="All brands">
          {featuredBrands.length > 0 && (
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                All Brands
              </span>
              <div className="flex-1 h-px bg-border/30" />
            </div>
          )}
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4"
            role="list"
          >
            {pageBrands.map((brand) => (
              <div key={brand.id} role="listitem">
                <CompactBrandCard brand={brand} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pagination for regular brands */}
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
      <section className="relative overflow-hidden bg-[#0D0D0D] px-4 py-16 md:py-24 md:px-8 lg:px-20">
        {/* Decorative blobs */}
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#FDA600]/10 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-[#01454A]/20 blur-3xl pointer-events-none"
        />
        {/* Gold diagonal accent */}
        <div
          aria-hidden="true"
          className="absolute top-0 right-0 h-px w-1/2 bg-gradient-to-l from-[#FDA600]/40 to-transparent"
        />

        <div className="relative max-w-3xl">
          <p className="font-raleway text-xs font-bold uppercase tracking-[0.25em] text-[#FDA600] mb-4">
            Discover Excellence
          </p>
          <h1 className="font-bon_foyage text-[clamp(2.5rem,8vw,7rem)] leading-none text-white">
            Fashion Brands
          </h1>
          <p className="mt-5 max-w-2xl font-raleway text-base leading-7 text-white/70">
            Browse our curated network of Nigerian and African fashion brands — every brand is
            vetted for quality, authenticity, and craftsmanship. AI-powered measurements ensure
            your perfect fit every time.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/get-measured"
              className="touch-target inline-flex items-center gap-2 rounded-full bg-[#FDA600] px-7 py-3 font-raleway text-sm font-bold text-black shadow-lg hover:bg-[#F0A000] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
              data-testid="brands-hero-measure-cta"
            >
              <Ruler size={14} />
              Get Measured Free
            </Link>
            <Link
              href="/products"
              className="touch-target inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3 font-raleway text-sm font-medium text-white backdrop-blur-sm hover:bg-white/10 transition-all duration-200"
            >
              Shop All Products
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
              <p className="font-bon_foyage text-2xl font-bold text-[#FDA600]">{value}</p>
              <p className="font-raleway text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Brand Grid ───────────────────────────────────────────────────── */}
      <section className="px-4 py-12 md:px-8 lg:px-20">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-raleway text-xs font-semibold uppercase tracking-widest text-[#FDA600] mb-1">
              Our Network
            </p>
            <h2 className="font-bon_foyage text-3xl text-foreground md:text-4xl">All Brands</h2>
          </div>
          <Link
            href="/auth/sign-up?role=vendor"
            className="font-raleway text-sm font-medium text-[#01454A] underline-offset-4 hover:underline transition-colors dark:text-[#FDA600]"
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
          <p className="font-raleway text-sm font-semibold uppercase tracking-widest text-[#FDA600]">
            Grow Your Brand
          </p>
          <h2 className="font-bon_foyage text-3xl text-white md:text-5xl">
            List Your Brand on Fashionistar
          </h2>
          <p className="font-raleway text-base text-white/70 leading-7">
            Join 200+ vetted Nigerian and African fashion brands reaching thousands of
            style-conscious clients daily. Zero commissions on your first 6 months.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/auth/sign-up?role=vendor"
              className="touch-target inline-block rounded-full bg-[#FDA600] px-10 py-3.5 font-raleway text-sm font-bold text-black shadow-lg hover:bg-[#F0A000] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
            >
              Apply to Sell
            </Link>
            <Link
              href="/get-measured"
              className="touch-target inline-block rounded-full border border-white/30 bg-white/5 px-10 py-3.5 font-raleway text-sm font-medium text-white backdrop-blur-sm hover:bg-white/10 transition-all duration-200"
            >
              Get Measured First
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
