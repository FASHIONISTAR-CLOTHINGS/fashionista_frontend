/**
 * app/(home)/collections/[slug]/page.tsx  — Phase C3 (Upgraded)
 *
 * Enterprise Collection Detail Page — full production implementation.
 *
 * Architecture:
 *   - RSC: getCollectionDetail() (v2 fields: is_active_now, banner_cta_text,
 *     banner_cta_url, cached_product_count, start_date, end_date, is_featured)
 *     + getCatalogCollections() for "More Collections" rail — parallel fetch
 *   - ISR: revalidate 300s, tagged ["collections", "collection-{slug}"]
 *   - Vendor grid: Suspense-wrapped CollectionVendorClient (infinite scroll)
 *   - SEO: meta_title / meta_description from model, OpenGraph
 *   - JSON-LD: Event (if date-bounded) or ItemList structured data
 *   - data-testid on key regions for Playwright
 */

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCollectionDetail, getCatalogCollections } from "@/features/catalog";
import CollectionVendorClient from "./CollectionVendorClient";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CollectionDetailPageProps {
  params: Promise<{ slug: string }>;
}

const VALIDATION_SLUG = "__collection_validation__";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDateRange(start?: string | null, end?: string | null): string | null {
  if (!start && !end) return null;
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  if (start && end) return `${fmt(start)} — ${fmt(end)}`;
  if (start) return `From ${fmt(start)}`;
  if (end) return `Until ${fmt(end)}`;
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Static params
// ─────────────────────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  try {
    const collections = await getCatalogCollections();
    const params = collections
      .slice(0, 24)
      .filter((c) => Boolean(c.slug))
      .map((c) => ({ slug: c.slug }));
    return params.length > 0 ? params : [{ slug: VALIDATION_SLUG }];
  } catch {
    return [{ slug: VALIDATION_SLUG }];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: CollectionDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug === VALIDATION_SLUG) return { title: "Collections | Fashionistar" };

  const collection = await getCollectionDetail(slug);
  if (!collection) return { title: "Collection | Fashionistar" };

  const title =
    collection.meta_title ||
    `${collection.title} | Fashionistar Collections`;
  const description =
    collection.meta_description ||
    collection.description ||
    `Browse the ${collection.title} collection on Fashionistar.`;
  const coverImage =
    collection.background_image_url || collection.image_url;

  return {
    title,
    description,
    alternates: { canonical: `/collections/${slug}` },
    openGraph: {
      title: collection.title,
      description,
      url: `https://fashionistar.net/collections/${slug}`,
      type: "website",
      images: coverImage
        ? [{ url: coverImage, alt: collection.title }]
        : undefined,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default async function CollectionDetailPage({
  params,
}: CollectionDetailPageProps) {
  const { slug } = await params;

  if (slug === VALIDATION_SLUG) notFound();

  // Parallel fetch: collection detail + all collections for "More" section
  const [collection, allCollections] = await Promise.all([
    getCollectionDetail(slug),
    getCatalogCollections(),
  ]);

  if (!collection) notFound();

  const otherCollections = allCollections
    .filter((c) => c.slug !== slug)
    .slice(0, 4);

  const coverImage =
    collection.background_image_url || collection.image_url;
  const productCount = collection.cached_product_count ?? null;
  const dateRange = formatDateRange(collection.start_date, collection.end_date);
  const isActive = collection.is_active_now ?? true;
  const ctaText = collection.banner_cta_text || "Shop Now";
  const ctaUrl = collection.banner_cta_url || "/categories";

  // JSON-LD: Event if date-bounded, otherwise ItemList
  const jsonLd = collection.start_date || collection.end_date
    ? {
        "@context": "https://schema.org",
        "@type": "Event",
        name: collection.title,
        description: collection.description || undefined,
        startDate: collection.start_date || undefined,
        endDate: collection.end_date || undefined,
        url: `https://fashionistar.net/collections/${slug}`,
        image: coverImage || undefined,
        organizer: {
          "@type": "Organization",
          name: "Fashionistar",
          url: "https://fashionistar.net",
        },
      }
    : {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: collection.title,
        description: collection.description || undefined,
        url: `https://fashionistar.net/collections/${slug}`,
      };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-background text-foreground" data-testid="collection-detail-page">

        {/* ── Hero Banner ─────────────────────────────────────────────────── */}
        <section
          className="relative min-h-[320px] md:min-h-[440px] bg-[#01454A] flex items-end overflow-hidden"
          data-testid="collection-hero"
        >
          {coverImage && (
            <Image
              src={coverImage}
              alt={collection.title}
              fill
              sizes="100vw"
              className="object-cover opacity-30"
              priority
            />
          )}
          {/* Deep gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#01454A] via-[#01454A]/60 to-transparent" />

          <div className="relative z-10 px-5 py-12 md:px-10 lg:px-20 w-full max-w-4xl space-y-5">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-white/60 font-raleway" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[#FDA600] transition-colors">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/collections" className="hover:text-[#FDA600] transition-colors">Collections</Link>
              <span aria-hidden="true">/</span>
              <span className="text-white/85">{collection.title}</span>
            </nav>

            {/* Status badges */}
            <div className="flex flex-wrap items-center gap-2">
              {collection.is_featured && (
                <span className="rounded-full bg-[#FDA600]/25 border border-[#FDA600]/40 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#FDA600]">
                  ⭐ Featured
                </span>
              )}
              {isActive ? (
                <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  ● Active Now
                </span>
              ) : (
                <span className="rounded-full bg-white/10 border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/60">
                  Upcoming
                </span>
              )}
            </div>

            {collection.sub_title && (
              <p className="font-raleway text-sm font-bold uppercase tracking-widest text-[#FDA600]">
                {collection.sub_title}
              </p>
            )}

            <h1 className="font-bon_foyage text-4xl text-white leading-tight md:text-6xl lg:text-7xl">
              {collection.title}
            </h1>

            {/* Date range */}
            {dateRange && (
              <p className="text-sm text-white/60 font-raleway flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {dateRange}
              </p>
            )}

            {/* Product count */}
            {productCount !== null && productCount > 0 && (
              <p className="text-sm text-white/60 font-raleway flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                {productCount.toLocaleString()} products in this collection
              </p>
            )}

            {collection.description && (
              <p className="font-raleway text-base leading-7 text-white/75 max-w-2xl">
                {collection.description}
              </p>
            )}

            {/* CTAs */}
            <div className="flex items-center gap-3 pt-1">
              <Link
                href={ctaUrl}
                className="rounded-full bg-[#FDA600] px-7 py-3 font-raleway text-sm font-bold text-black shadow hover:bg-[#FDA600]/90 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {ctaText}
              </Link>
              <Link
                href="/get-measured"
                className="rounded-full border border-white/40 px-7 py-3 font-raleway text-sm font-semibold text-white hover:bg-white/10 transition-all duration-200"
              >
                Get Measured
              </Link>
            </div>
          </div>
        </section>

        {/* ── Vendors Section ──────────────────────────────────────────────── */}
        <section
          className="px-5 py-12 md:px-10 lg:px-20"
          data-testid="collection-vendors-section"
        >
          <div className="mb-8">
            <h2 className="font-bon_foyage text-2xl text-foreground md:text-4xl">
              Vendors in this Collection
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl font-raleway">
              These expert fashion stores specialise in the {collection.title}{" "}
              collection — browse their curated shops to find your perfect look.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="shimmer h-52 rounded-2xl"
                    style={{ animationDelay: `${i * 80}ms` }}
                  />
                ))}
              </div>
            }
          >
            <CollectionVendorClient collectionSlug={slug} />
          </Suspense>
        </section>

        {/* ── More Collections ─────────────────────────────────────────────── */}
        {otherCollections.length > 0 && (
          <section
            className="bg-[#F8F9FC] px-5 py-14 md:px-10 lg:px-20 space-y-8"
            data-testid="other-collections-section"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bon_foyage text-2xl text-foreground md:text-4xl">
                More Collections
              </h2>
              <Link
                href="/collections"
                className="text-sm font-semibold text-[#01454A] hover:underline"
              >
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {otherCollections.map((col) => {
                const colCover = col.background_image_url || col.image_url;
                return (
                  <Link
                    key={col.id}
                    href={`/collections/${col.slug}`}
                    className="group relative rounded-2xl overflow-hidden border border-border bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="relative h-48 bg-[#F4F3EC]">
                      {colCover ? (
                        <Image
                          src={colCover}
                          alt={col.title}
                          fill
                          sizes="(max-width: 640px) 100vw, 25vw"
                          className="object-contain p-6 group-hover:scale-105 transition-transform duration-400"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <span className="font-bon_foyage text-4xl text-[#01454A]/20">
                            {col.title[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      {col.sub_title && (
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#01454A] mb-1">
                          {col.sub_title}
                        </p>
                      )}
                      <h3 className="font-raleway font-bold text-base text-foreground group-hover:text-[#01454A] transition-colors">
                        {col.title}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
