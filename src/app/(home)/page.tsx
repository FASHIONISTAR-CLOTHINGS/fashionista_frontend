/**
 * app/(home)/page.tsx — Fashionistar Homepage (Consolidated 12-section bundle)
 *
 * Production Architecture 2026–2028:
 *   - Single RSC with ONE server fetch: getHomepageBundle() (12-section consolidated)
 *   - Backend: 12 parallel DB queries via asyncio.gather(return_exceptions=True) < 30ms p95
 *   - Frontend: ISR revalidate 300s — matches backend Redis TTL
 *   - ALL sections receive data as props — ZERO additional HTTP round-trips
 *   - Suspense boundaries with pixel-perfect skeleton fallbacks
 *   - data-testid on every section for Playwright E2E tests
 *   - Semantic HTML5 section tags with aria-label on every section
 *   - Every section has a CTA + typed empty state (never disappears)
 *
 * 12 sections (consolidated bundle):
 *   collections, categories, featured_products, hot_deals, reviews, banners,
 *   trending_products, vendors, blog_posts, trending_tags,
 *   deals_of_the_week, new_arrivals
 *
 * Data flow:
 *   getHomepageBundle() → HomepageBundle →
 *     { collections, categories, featured_products, hot_deals, reviews, banners,
 *       trending_products, vendors, blog_posts, trending_tags,
 *       deals_of_the_week, new_arrivals }
 *       ↓ props to each section component (no re-fetch anywhere)
 */

import Link from "next/link";
import { Suspense } from "react";
import { CatalogCategoryGrid, CatalogCollectionGrid } from "@/features/catalog";
import { getHomepageBundle } from "@/features/catalog/api/catalog.server";
import TabbedFeaturedProducts, { HomepageFeaturedProductsSkeleton } from "@/features/catalog/components/TabbedFeaturedProducts";
import { CatalogBannerHero } from "@/features/catalog/components/CatalogBannerHero";
import { RecentlyViewedSection } from "./_components/RecentlyViewedSection";
import { DealsCountdown } from "./_components/DealsCountdown";
import { NewsletterForm } from "./_components/NewsletterForm";
import { HomepageHotDealsSection } from "./_components/HomepageHotDealsSection";
import { HomepageReviewsSection } from "./_components/HomepageReviewsSection";
import { WaitlistMobileForm } from "./_components/WaitlistMobileForm";
import { TrustBar } from "./_components/TrustBar";
import { MeasurementCTABanner } from "./_components/MeasurementCTABanner";
import { StickyMobileCTA } from "./_components/StickyMobileCTA";
import { TrendingProductsRail } from "./_components/TrendingProductsRail";
import { VendorSpotlightSection } from "./_components/VendorSpotlightSection";
import { BlogStyleGuideRail } from "./_components/BlogStyleGuideRail";
import { AIPersonalizedGreeting } from "./_components/AIPersonalizedGreeting";
import { UrgencyBanner } from "./_components/UrgencyBanner";
import { LiveShopperCounter } from "./_components/LiveShopperCounter";
import { PersonalizedRail } from "./_components/PersonalizedRail";
import { NewArrivalsRail } from "./_components/NewArrivalsRail";
import { TrendingTagsRail } from "./_components/TrendingTagsRail";
import { EmailCaptureModalLazy } from "./_components/EmailCaptureModalLazy";
import { LiveSocialProofToast } from "@/components/commerce/LiveSocialProofToast";
import { Hero } from "@/components";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import {
  generateWebSiteSchema,
  generateItemListSchema,
} from "@/components/seo/schemas";

// Skeleton placeholder for Trending and Vendor sections
const TrendingProductsRailSkeleton = () => (
  <div className="px-5 md:px-10 lg:px-20 py-8 animate-pulse">
    <div className="h-8 w-48 bg-gray-200 rounded mb-6" />
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="aspect-square bg-gray-200 rounded-2xl" />
      ))}
    </div>
  </div>
);

const VendorSpotlightSkeleton = () => (
  <div className="px-5 md:px-10 lg:px-20 py-8 animate-pulse">
    <div className="h-8 w-56 bg-gray-200 rounded mb-6" />
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-40 bg-gray-200 rounded-2xl" />
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// ISR — 5 minute cache, stale-while-revalidate semantics on CDN edge.
// Matches the backend Redis TTL for catalog:homepage:bundle.
// ─────────────────────────────────────────────────────────────────────────────
export const dynamic = "force-dynamic";
export const revalidate = 300;

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
  alternates: {
    canonical: "https://fashionistar.net/",
  },
  openGraph: {
    title: "Fashionistar — AI-Powered Fashion & Custom Tailoring",
    description:
      "Nigeria's premier AI-powered e-commerce platform connecting clients with verified tailors.",
    type: "website",
    images: [
      {
        url: "https://res.cloudinary.com/fashionistar/image/upload/w_1200,h_630,c_fill,f_auto,q_auto/fashionistar-og-image",
        width: 1200,
        height: 630,
        alt: "Fashionistar — AI-Powered Fashion & Custom Tailoring in Nigeria",
      },
    ],
    siteName: "Fashionistar",
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fashionistar — AI-Powered Fashion & Custom Tailoring",
    description: "Nigeria's premier AI-powered fashion e-commerce platform.",
    images: ["https://res.cloudinary.com/fashionistar/image/upload/w_1200,h_630,c_fill,f_auto,q_auto/fashionistar-og-image"],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Homepage Page — APEX Sprint Psychological Funnel
//
// Section order (conversion-optimised):
//   1. Hero (CMS banner or static)
//   2. TrustBar — instant credibility
//   3. Mobile email waitlist (mobile only)
//   4. Shop by Category
//   5. MeasurementCTABanner — "Measure or Buy" binary choice
//   6. Featured Products (limit 8)
//   7. Recently Viewed
//   8. Collections
//   9. Campaign Banner (highlighted collection promo)
//   10. Deals of the Week (6 cards, was 4)
//   11. Customer Reviews
//   12. Newsletter CTA
//   13. StickyMobileCTA (30s delayed, dismissible)
// ─────────────────────────────────────────────────────────────────────────────

export default async function Home() {
  /**
   * ONE server-side fetch — backend asyncio.gather(return_exceptions=True) runs
   * 12 DB queries in parallel via /catalog/homepage/ (consolidated bundle).
   * ISR: revalidate 300s, tagged "homepage-bundle" for on-demand invalidation.
   * On error → EMPTY_BUNDLE (homepage never crashes, sections degrade to empty states).
   * Consolidated: bundle now includes blog_posts, trending_tags, deals_of_the_week, new_arrivals.
   */
  const bundle = await getHomepageBundle();
  const highlightedCollection = bundle.collections[0] ?? null;
  const categoryCount = bundle.meta.categories_count || bundle.categories.length;
  const collectionCount = bundle.meta.collections_count || bundle.collections.length;

  // DealsCountdown fallback — if no product has a countdown date,
  // use next Sunday midnight as a universal weekly deals reset anchor.
  const countdownTarget: string | undefined =
    (bundle.deals_of_the_week.find((p) => p.discount_countdown)?.discount_countdown as string | undefined) ??
    (bundle.hot_deals.find((p) => p.discount_countdown)?.discount_countdown as string | undefined) ??
    (() => {
      const d = new Date();
      const daysUntilSunday = (7 - d.getDay()) % 7 || 7;
      d.setDate(d.getDate() + daysUntilSunday);
      d.setHours(23, 59, 59, 0);
      return d.toISOString();
    })();

  return (
    <div className="flex flex-col gap-0" data-testid="homepage">

      {/* ── Work 4: Urgency Banner ────────────────────────────────────────── */}
      <UrgencyBanner />

      {/* ── 1. Hero: CMS Banner if available, else static Hero ─────────────── */}
      <section aria-label="Homepage Hero" data-testid="hero-section">
        {bundle.banners.length > 0 ? (
          <CatalogBannerHero banners={bundle.banners} />
        ) : (
          <Hero />
        )}
      </section>

      {/* ── 2. Trust Bar ──────────────────────────────────────────────────── */}
      <section aria-label="Trust Signals" data-testid="trust-bar">
        <TrustBar />
      </section>

      {/* ── Live Shopper Counter ───────────────────────────────────────────── */}
      <div className="flex justify-center py-3" data-testid="live-shopper-counter" suppressHydrationWarning>
        <LiveShopperCounter />
      </div>

      {/* ── AI Personalized Greeting ───────────────────────────────────────── */}
      <div data-testid="ai-greeting" suppressHydrationWarning>
        <AIPersonalizedGreeting />
      </div>

      {/* ── 3. Mobile email waitlist (mobile only) ─────────────────────────── */}
      <div className="mt-8 md:hidden flex z-30 px-4" data-testid="mobile-email-waitlist">
        {/* WaitlistMobileForm is a client component — form action handled there */}
        <WaitlistMobileForm />
      </div>

      {/* ── 4. Shop by Category ────────────────────────────────────────────── */}
      <section aria-label="Shop by Category" data-testid="category-grid-section">
        <CatalogCategoryGrid categories={bundle.categories} />
      </section>

      {/* ── 5. AI Measurement CTA Banner ──────────────────────────────────── */}
      <section aria-label="AI Body Measurement" data-testid="measurement-cta-banner">
        <MeasurementCTABanner />
      </section>

      {/* ── 6. Featured Products — Tabbed Rails ───────────────────────────── */}
      <section aria-label="Featured Products" data-testid="featured-products-section">
        <Suspense fallback={<HomepageFeaturedProductsSkeleton count={8} />}>
          <TabbedFeaturedProducts products={bundle.featured_products} limit={8} />
        </Suspense>
      </section>

      {/* ── 7. Trending Now Rail (APEX v4: props from bundle — zero extra fetch) */}
      <section aria-label="Trending Now" data-testid="trending-products-section">
        <Suspense fallback={<TrendingProductsRailSkeleton />}>
          <TrendingProductsRail products={bundle.trending_products} />
        </Suspense>
      </section>

      {/* ── Personalized Rail ──────────────────────────────────────────────── */}
      <section aria-label="Recommended for You" data-testid="personalized-rail">
        <PersonalizedRail />
      </section>

      {/* ── 8. Recently Viewed Rail ────────────────────────────────────────── */}
      <section aria-label="Recently Viewed" data-testid="recently-viewed-section">
        <RecentlyViewedSection />
      </section>

      {/* ── 9. Collections ────────────────────────────────────────────────────── */}
      <section aria-label="Shop Collections" data-testid="collection-grid-section">
        <CatalogCollectionGrid collections={bundle.collections} />
      </section>

      {/* ── Campaign Banner ────────────────────────────────────────────────── */}
      <section
        aria-label="Campaign Banner"
        className="w-full bg-[#fda600] relative p-8 md:p-14 lg:p-24 overflow-hidden"
        data-testid="campaign-banner"
      >
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/10 via-transparent to-[#01454A]/10" aria-hidden="true" />
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
                href="/get-measured"
                className="px-10 py-3 md:py-4 rounded-[100px] border border-[#01454A]/20 bg-white/60 text-[#01454A] font-raleway font-semibold text-base hover:bg-white transition-all duration-300 min-h-[44px] inline-flex items-center"
                data-testid="campaign-get-measured-cta"
              >
                Get Measured Free
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
      </section>

      {/* ── 10. Deals of the Week ───────────────────────────────────────────── */}
      <section
        aria-label="Deals of the Week"
        className="px-5 py-10 md:px-10 lg:px-20 space-y-6 md:space-y-10 animate-fade-slide-up"
        data-testid="deals-section"
      >
        <div className="flex flex-wrap justify-center md:justify-normal items-center gap-5 lg:gap-16">
          <h2 className="font-bon_foyage whitespace-nowrap text-center text-[clamp(2rem,5vw,3.5rem)] leading-tight text-[#333]">
            Deals of the Week
          </h2>
          <div data-testid="deals-countdown">
            {/* APEX v4: countdownTarget has a fallback (next Sunday midnight) */}
            <DealsCountdown targetDate={countdownTarget} />
          </div>
        </div>
        {/* Use deals_of_the_week from the 12-way bundle (steep-discount products
            with discount_countdown). Falls back to hot_deals if empty. */}
        <HomepageHotDealsSection
          products={
            (bundle.deals_of_the_week?.length ?? 0) > 0
              ? bundle.deals_of_the_week.slice(0, 6)
              : bundle.hot_deals.slice(0, 6)
          }
        />
      </section>

      {/* ── 11. Customer Reviews ─────────────────────────────────────────────── */}
      <section aria-label="Customer Reviews" data-testid="reviews-section">
        <HomepageReviewsSection reviews={bundle.reviews} />
      </section>

      {/* ── 12. Blog Style Guide Rail ──────────────────────────────────────── */}
      <section
        aria-label="Style Guide & Blog"
        data-testid="blog-rail-section"
        className="animate-fade-slide-up"
      >
        <BlogStyleGuideRail posts={bundle.blog_posts} />
      </section>

      {/* ── 12b. Trending Tags Rail ─────────────────────────────────────────── */}
      <section
        aria-label="Trending Tags"
        data-testid="trending-tags-section"
        className="animate-fade-slide-up"
      >
        <TrendingTagsRail tags={bundle.trending_tags} />
      </section>

      {/* ── 12c. New Arrivals Rail ──────────────────────────────────────────── */}
      <section
        aria-label="New Arrivals"
        data-testid="new-arrivals-section"
        className="animate-fade-slide-up"
      >
        <NewArrivalsRail products={bundle.new_arrivals} />
      </section>

      {/* ── 13. Vendor Spotlight (APEX v4: props from bundle — zero extra fetch) */}
      <section aria-label="Meet Our Vendors" data-testid="vendor-spotlight-section">
        <Suspense fallback={<VendorSpotlightSkeleton />}>
          <VendorSpotlightSection vendors={bundle.vendors} />
        </Suspense>
      </section>

      {/* ── Newsletter CTA ───────────────────────────────────────────────────── */}
      <section aria-label="Stay in Style — Newsletter" data-testid="newsletter-section">
        <div
          className="mx-5 md:mx-10 lg:mx-20 mb-10 rounded-3xl bg-gradient-to-r from-[#01454A] to-[#01454A]/80 p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8"
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
      </section>

      {/* ── 13. Sticky Mobile CTA (30s delay, 24h dismissal) ───────────────── */}
      <StickyMobileCTA />

      {/* ── Work 4: Live Social Proof Toasts ──────────────────────────────── */}
      <LiveSocialProofToast />

      {/* ── Work 10: Email Capture Modal ──────────────────────────────────── */}
      <EmailCaptureModalLazy />

      {/* ── JSON-LD Structured Data ─────────────────────────────────────────── */}
      {/* WebSite schema: helps Google index Fashionistar as a site entity */}
      <JsonLdScript id="website-ld" data={generateWebSiteSchema()} />
      {/* Organization schema: APEX v4 addition for brand entity recognition */}
      <JsonLdScript
        id="organization-ld"
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Fashionistar",
          url: "https://fashionistar.net",
          logo: "https://res.cloudinary.com/fashionistar/image/upload/f_auto,q_auto/fashionistar-logo",
          sameAs: [
            "https://instagram.com/fashionistar",
            "https://facebook.com/fashionistar",
            "https://twitter.com/fashionistar",
          ],
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            areaServed: "NG",
            availableLanguage: "English",
          },
        }}
      />
      {bundle.featured_products.length > 0 && (
        <JsonLdScript
          id="featured-products-ld"
          data={generateItemListSchema(bundle.featured_products, "Featured Products")}
        />
      )}
      {bundle.hot_deals.length > 0 && (
        <JsonLdScript
          id="hot-deals-ld"
          data={generateItemListSchema(bundle.hot_deals, "Deals of the Week")}
        />
      )}
    </div>
  );
}
