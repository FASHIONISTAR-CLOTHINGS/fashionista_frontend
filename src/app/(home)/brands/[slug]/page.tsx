/**
 * app/(home)/brands/[slug]/page.tsx  — Phase C2 (Upgraded)
 *
 * Enterprise Brand Detail Page — full production implementation.
 *
 * Architecture:
 *   - RSC: getBrandDetail() (new endpoint returning v2 fields: country,
 *     established_year, verified, premium, logo_banner, cached_product_count)
 *     + getCatalogBrands() for the "More Brands" rail — parallel fetch
 *   - ISR: revalidate 300s, tagged ["brands", "brand-{slug}"]
 *   - Product grid: Suspense-wrapped client component (infinite scroll)
 *   - SEO: meta_title / meta_description from model, OpenGraph, Twitter card
 *   - JSON-LD: Organization structured data
 *   - data-testid on key regions for Playwright E2E
 */

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getBrandDetail, getCatalogBrands } from "@/features/catalog";
import { ProductGridSkeleton } from "@/features/product";
import BrandProductsClient from "./BrandProductsClient";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface BrandDetailPageProps {
  params: Promise<{ slug: string }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const COUNTRY_NAMES: Record<string, string> = {
  NG: "Nigeria",
  GH: "Ghana",
  ZA: "South Africa",
  GB: "United Kingdom",
  US: "United States",
  FR: "France",
  IT: "Italy",
};

function getCountryName(code?: string): string | null {
  if (!code) return null;
  return COUNTRY_NAMES[code.toUpperCase()] ?? code;
}

// ─────────────────────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: BrandDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandDetail(slug);
  if (!brand) return { title: "Brand | Fashionistar" };

  const title =
    brand.meta_title ||
    `${brand.title} | Fashionistar Brands`;
  const description =
    brand.meta_description ||
    brand.description ||
    `Explore ${brand.title} — curated Nigerian fashion on Fashionistar.`;
  const coverImage = brand.logo_banner || brand.image_url;

  return {
    title,
    description,
    alternates: { canonical: `/brands/${slug}` },
    openGraph: {
      title: brand.title,
      description,
      url: `https://fashionistar.net/brands/${slug}`,
      type: "website",
      images: coverImage ? [{ url: coverImage, alt: brand.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: brand.meta_title || brand.title,
      description,
      images: coverImage ? [coverImage] : undefined,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Static Params
// ─────────────────────────────────────────────────────────────────────────────

const VALIDATION_SLUG = "__brand_validation__";

export async function generateStaticParams() {
  try {
    const brands = await getCatalogBrands();
    const params = brands
      .slice(0, 48)
      .filter((b) => Boolean(b.slug))
      .map((b) => ({ slug: b.slug }));

    return params.length > 0 ? params : [{ slug: VALIDATION_SLUG }];
  } catch {
    return [{ slug: VALIDATION_SLUG }];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default async function BrandDetailPage({
  params,
}: BrandDetailPageProps) {
  const { slug } = await params;

  if (slug === VALIDATION_SLUG) notFound();

  // Parallel fetch: brand detail + all brands for the "More Brands" rail
  const [brand, allBrands] = await Promise.all([
    getBrandDetail(slug),
    getCatalogBrands(),
  ]);

  if (!brand) notFound();

  const otherBrands = allBrands
    .filter((b) => b.slug !== slug)
    .slice(0, 6);

  const productCount = brand.cached_product_count ?? null;
  const countryName = getCountryName(brand.country);
  const coverImage = brand.logo_banner || brand.image_url;

  // JSON-LD: Organization schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand.title,
    description: brand.description || undefined,
    url: `https://fashionistar.net/brands/${slug}`,
    logo: brand.image_url || undefined,
    image: coverImage || undefined,
    foundingDate: brand.established_year?.toString() || undefined,
    address: brand.country
      ? { "@type": "PostalAddress", addressCountry: brand.country }
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-background text-foreground" data-testid="brand-detail-page">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section
          className="relative min-h-[300px] md:min-h-[420px] bg-[#0D0D0D] flex items-end overflow-hidden"
          data-testid="brand-hero"
        >
          {/* Background: logo_banner or image as texture */}
          {coverImage && (
            <Image
              src={coverImage}
              alt={brand.title}
              fill
              sizes="100vw"
              className="object-contain p-16 opacity-15 scale-110"
              priority
            />
          )}

          {/* Dark-to-transparent gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/70 to-transparent" />

          <div className="relative z-10 px-5 py-12 md:px-10 lg:px-20 w-full max-w-5xl space-y-5">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-white/50 font-raleway" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[#FDA600] transition-colors">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/brands" className="hover:text-[#FDA600] transition-colors">Brands</Link>
              <span aria-hidden="true">/</span>
              <span className="text-white/80">{brand.title}</span>
            </nav>

            {/* Brand label + verification badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#FDA600]">
                Brand
              </span>
              {brand.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 border border-blue-400/30 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-300">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              )}
              {brand.premium && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#FDA600]/20 border border-[#FDA600]/30 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#FDA600]">
                  ★ Premium
                </span>
              )}
            </div>

            <h1 className="font-bon_foyage text-5xl text-white leading-none md:text-7xl">
              {brand.title}
            </h1>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-5 text-sm text-white/60 font-raleway">
              {countryName && (
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {countryName}
                </span>
              )}
              {brand.established_year && (
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Est. {brand.established_year}
                </span>
              )}
              {productCount !== null && productCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  {productCount.toLocaleString()} Products
                </span>
              )}
              {brand.website_url && (
                <a
                  href={brand.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#FDA600] hover:underline text-xs"
                >
                  Visit Website ↗
                </a>
              )}
            </div>

            {brand.description && (
              <p className="font-raleway text-base leading-7 text-white/70 max-w-2xl">
                {brand.description}
              </p>
            )}

            {/* CTAs */}
            <div className="flex items-center gap-3 pt-1">
              <Link
                href={`/brands/${slug}`}
                className="rounded-full bg-[#FDA600] px-7 py-3 font-raleway text-sm font-bold text-black shadow hover:bg-[#FDA600]/90 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Shop Products
              </Link>
              {brand.website_url && (
                <a
                  href={brand.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/40 px-7 py-3 font-raleway text-sm font-semibold text-white hover:bg-white/10 transition-all duration-200"
                >
                  Official Site ↗
                </a>
              )}
            </div>
          </div>
        </section>

        {/* ── Brand logo accent strip ──────────────────────────────────────── */}
        {brand.image_url && (
          <div className="flex items-center gap-6 px-5 py-5 md:px-10 lg:px-20 border-b border-border bg-card">
            <div className="relative h-14 w-32 shrink-0">
              <Image
                src={brand.image_url}
                alt={`${brand.title} logo`}
                fill
                sizes="128px"
                className="object-contain"
              />
            </div>
            {brand.description && (
              <p className="text-sm text-muted-foreground font-raleway line-clamp-2 max-w-lg hidden md:block">
                {brand.description}
              </p>
            )}
          </div>
        )}

        {/* ── Products Section ─────────────────────────────────────────────── */}
        <section
          className="px-5 py-12 md:px-10 lg:px-20"
          data-testid="brand-products-section"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-bon_foyage text-2xl text-foreground md:text-4xl">
              {brand.title} Products
            </h2>
            {productCount !== null && productCount > 0 && (
              <span className="text-sm text-muted-foreground font-raleway">
                {productCount.toLocaleString()} items
              </span>
            )}
          </div>
          <Suspense fallback={<ProductGridSkeleton count={8} />}>
            <BrandProductsClient brandSlug={slug} />
          </Suspense>
        </section>

        {/* ── More Brands ──────────────────────────────────────────────────── */}
        {otherBrands.length > 0 && (
          <section
            className="bg-[#F8F9FC] px-5 py-14 md:px-10 lg:px-20 space-y-8"
            data-testid="other-brands-section"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bon_foyage text-2xl text-foreground md:text-4xl">
                More Brands
              </h2>
              <Link href="/brands" className="text-sm font-semibold text-[#01454A] hover:underline">
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {otherBrands.map((b) => (
                <Link
                  key={b.id}
                  href={`/brands/${b.slug}`}
                  className="group flex flex-col items-center rounded-2xl border border-border bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="relative h-16 w-full mb-3">
                    {b.image_url ? (
                      <Image
                        src={b.image_url}
                        alt={b.title}
                        fill
                        sizes="(max-width: 640px) 50vw, 16vw"
                        className="object-contain group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <span className="text-3xl font-bon_foyage text-[#D9D9D9]">
                          {b.title.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-raleway font-bold text-xs text-foreground text-center leading-tight">
                    {b.title}
                  </h3>
                  {b.verified && (
                    <span className="text-[9px] text-blue-500 font-bold uppercase tracking-wide mt-1">
                      ✓ Verified
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
