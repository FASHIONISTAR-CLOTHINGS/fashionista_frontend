/**
 * app/(home)/page.tsx — Fashionistar Homepage (v2 — Phase C1 + D2)
 *
 * Production Architecture 2026–2027:
 *   - Single RSC with ONE server fetch: getHomepageBundle() (v1 compatible)
 *     OR getHomepageBundleV2() for 6-section bundle with banners.
 *   - Backend: 5–6 parallel DB queries via asyncio.gather() < 30ms p95
 *   - Frontend: ISR revalidate 300s — matches backend Redis TTL
 *   - ALL sections receive data as props — ZERO additional HTTP round-trips
 *   - Suspense boundaries with pixel-perfect skeleton fallbacks
 *   - data-testid on every section for Playwright E2E tests
 *
 * C1 Fix: CatalogCategoryGrid and CatalogCollectionGrid now receive
 *   bundle.categories and bundle.collections as props → zero double-fetch.
 *
 * Data flow:
 *   getHomepageBundleV2() → HomepageBundle →
 *     { collections, categories, featured_products, hot_deals, reviews, banners }
 *       ↓ props to each section component (no re-fetch anywhere)
 */

import Link from "next/link";
import { Suspense } from "react";
import { CatalogCategoryGrid, CatalogCollectionGrid } from "@/features/catalog";
import { getHomepageBundleV2 } from "@/features/catalog/api/catalog.server";
import { HomepageFeaturedProducts } from "@/features/catalog/components/HomepageFeaturedProducts";
import { CatalogBannerHero } from "@/features/catalog/components/CatalogBannerHero";
import { ProductGridSkeleton } from "@/features/product";
import { RecentlyViewedSection } from "./_components/RecentlyViewedSection";
import { DealsCountdown } from "./_components/DealsCountdown";
import { NewsletterForm } from "./_components/NewsletterForm";
import { HomepageHotDealsSection } from "./_components/HomepageHotDealsSection";
import { HomepageReviewsSection } from "./_components/HomepageReviewsSection";
import { WaitlistMobileForm } from "./_components/WaitlistMobileForm";
import { Hero } from "@/components";

// ─────────────────────────────────────────────────────────────────────────────
// Metadata — per-page SEO
// ─────────────────────────────────────────────────────────────────────────────

export const metadata = {
  title: "Fashionistar — AI-Powered Fashion & Custom Tailoring in Nigeria",
  description:
    "Shop premium bespoke clothing from verified Nigerian tailors. Use our AI body measurement system for a perfect fit. Collections, senator outfits, gowns & more.",
  keywords: [
    "Nigerian fashion",
    "bespoke tailoring",
    "AI measurement",
    "senator outfit",
    "custom clothing Nigeria",
  ],
  openGraph: {
    title: "Fashionistar — AI-Powered Fashion & Custom Tailoring",
    description:
      "Nigeria's premier AI-powered e-commerce platform connecting clients with verified tailors.",
    type: "website",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Homepage Page — Single bundle fetch → all sections receive props
// ─────────────────────────────────────────────────────────────────────────────

export default async function Home() {
  /**
   * ONE server-side fetch — backend asyncio.gather() runs 6 DB queries in
   * parallel via /catalog/homepage/bundle/ (Phase B3).
   * ISR: revalidate 300s, tagged "homepage-bundle" for on-demand invalidation.
   * On error → EMPTY_BUNDLE (homepage never crashes).
   */
  const bundle = await getHomepageBundleV2();
  const highlightedCollection = bundle.collections[0] ?? null;
  const categoryCount = bundle.meta.categories_count || bundle.categories.length;
  const collectionCount = bundle.meta.collections_count || bundle.collections.length;

  return (
    <div className="flex flex-col gap-0" data-testid="homepage">

      {/* ── Hero: CMS Banner if available, else static Hero ──────────────── */}
      {bundle.banners.length > 0 ? (
        <CatalogBannerHero banners={bundle.banners} />
      ) : (
        <Hero />
      )}

      {/* ── Mobile email waitlist ───────────────────────────────────── */}
      <div className="mt-8 md:hidden flex z-30 px-4" data-testid="mobile-email-waitlist">
        {/* WaitlistMobileForm is a client component — form action handled there */}
        <WaitlistMobileForm />
      </div>

      {/* ── Live Category Grid (C1 FIX: no internal fetch — uses bundle.categories) ── */}
      <div data-testid="category-grid-section">
        <CatalogCategoryGrid categories={bundle.categories} />
      </div>

      {/* ── Featured Products (C2: extracted RSC component) ──────────────── */}
      <Suspense fallback={<ProductGridSkeleton count={8} />}>
        <HomepageFeaturedProducts bundle={bundle} limit={8} />
      </Suspense>

      {/* ── Recently Viewed Rail (client-side, localStorage) ─────────────── */}
      <RecentlyViewedSection />

      {/* ── Live Collection Grid (C1 FIX: no internal fetch — uses bundle.collections) ── */}
      <div data-testid="collection-grid-section">
        <CatalogCollectionGrid collections={bundle.collections} />
      </div>

      {/* ── Honest Live Promo Surface ─────────────────────────────────────── */}
      <div
        className="w-full bg-[#fda600] relative p-8 md:p-14 lg:p-24 overflow-hidden"
        data-testid="campaign-banner"
      >
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/10 via-transparent to-[#01454A]/10" />
        <div className="relative z-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-5">
            <p className="font-raleway font-semibold text-sm md:text-base text-black/70 tracking-[0.25em] uppercase">
              Live Fashionistar Edit
            </p>
            <h2 className="font-bon_foyage text-[clamp(2rem,6vw,4.5rem)] leading-tight text-black md:max-w-3xl">
              {highlightedCollection
                ? highlightedCollection.title
                : "Discover live collections, verified vendors, and tailored fashion with zero placeholder merchandising."}
            </h2>
            <p className="max-w-2xl font-raleway text-sm leading-7 text-black/75 md:text-base">
              {highlightedCollection?.description ||
                "Browse the latest live categories and collections published on Fashionistar. Every card on this page now reflects real catalog data or an explicit empty state."}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={highlightedCollection ? `/collections/${highlightedCollection.slug}` : "/collections"}
                className="px-10 py-3 md:py-4 rounded-[100px] bg-[#01454A] text-white font-raleway font-semibold text-base hover:bg-[#01454A]/90 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg min-h-[44px] inline-flex items-center"
              >
                {highlightedCollection ? "Explore Collection" : "Browse Collections"}
              </Link>
              <Link
                href="/products"
                className="px-10 py-3 md:py-4 rounded-[100px] border border-[#01454A]/20 bg-white/60 text-[#01454A] font-raleway font-semibold text-base hover:bg-white transition-all duration-300 min-h-[44px] inline-flex items-center"
              >
                Shop Products
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[2rem] bg-white/70 p-6 shadow-sm backdrop-blur">
              <p className="font-raleway text-xs font-bold uppercase tracking-[0.25em] text-[#01454A]/70">
                Categories
              </p>
              <p className="mt-3 font-bon_foyage text-5xl text-[#01454A]">{categoryCount}</p>
              <p className="mt-2 font-raleway text-sm leading-6 text-[#01454A]/80">
                Live discovery lanes published for shoppers right now.
              </p>
            </div>
            <div className="rounded-[2rem] bg-white/70 p-6 shadow-sm backdrop-blur">
              <p className="font-raleway text-xs font-bold uppercase tracking-[0.25em] text-[#01454A]/70">
                Collections
              </p>
              <p className="mt-3 font-bon_foyage text-5xl text-[#01454A]">{collectionCount}</p>
              <p className="mt-2 font-raleway text-sm leading-6 text-[#01454A]/80">
                Curated edits pulled from the live catalog bundle.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Deals of the Week (live from hot_deals in bundle) ────────────── */}
      <div
        className="px-5 py-10 md:px-10 lg:px-20 space-y-6 md:space-y-10"
        data-testid="deals-section"
      >
        <div className="flex flex-wrap justify-center md:justify-normal items-center gap-5 lg:gap-16">
          <h2 className="font-bon_foyage whitespace-nowrap text-center text-[clamp(2rem,5vw,3.5rem)] leading-tight text-[#333]">
            Deals of the Week
          </h2>
          <div data-testid="deals-countdown">
            <DealsCountdown />
          </div>
        </div>

        {/* Hot deal cards — live from homepage bundle (zero extra fetch) */}
        <HomepageHotDealsSection products={bundle.hot_deals} />
      </div>

      {/* ── Customer Reviews (from homepage bundle) ──────────────────────── */}
      <div data-testid="reviews-section">
        <HomepageReviewsSection reviews={bundle.reviews} />
      </div>

      {/* ── Newsletter CTA ────────────────────────────────────────────────── */}
      <div
        className="mx-5 md:mx-10 lg:mx-20 mb-10 rounded-3xl bg-gradient-to-r from-[#01454A] to-[#01454A]/80 p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8"
        data-testid="newsletter-section"
      >
        <div>
          <h2 className="font-bon_foyage text-3xl md:text-4xl text-white mb-2">
            Stay in Style
          </h2>
          <p className="font-raleway text-[#ECE6D6]/80 text-base md:text-lg">
            Get exclusive deals, new arrivals and style tips delivered to your inbox.
          </p>
        </div>
        <NewsletterForm />
      </div>

      {/* ── JSON-LD Structured Data ─────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Fashionistar",
            url: "https://fashionistar.net",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://fashionistar.net/products?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
      {bundle.featured_products.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: "Featured Products",
              itemListElement: bundle.featured_products.slice(0, 8).map((p, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: p.title,
                url: `https://fashionistar.net/products/${p.slug}`,
              })),
            }),
          }}
        />
      )}  
    </div>
  );
}
