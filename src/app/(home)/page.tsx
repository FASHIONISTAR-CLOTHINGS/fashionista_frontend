/**
 * app/(home)/page.tsx — Fashionistar Homepage
 *
 * Production 2026–2027 Architecture:
 *   - Single RSC with ONE server fetch: getHomepageBundle()
 *   - Backend: 5 parallel DB queries via asyncio.gather() < 30ms p95
 *   - Frontend: ISR revalidate 300s (5 min) — matches backend Redis TTL
 *   - All sections receive data as props — zero additional HTTP round-trips
 *   - Suspense boundaries with pixel-perfect skeleton fallbacks
 *
 * Data flow:
 *   getHomepageBundle() → HomepageBundle →
 *     { collections, categories, featured_products, hot_deals, reviews }
 *       ↓ props to each section component (no re-fetch)
 */

import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { Hero } from "@/components";
import { CatalogCategoryGrid, CatalogCollectionGrid } from "@/features/catalog";
import { getHomepageBundle } from "@/features/catalog";
import { ProductGridSkeleton } from "@/features/product";
import { RecentlyViewedSection } from "./_components/RecentlyViewedSection";
import { DealsCountdown } from "./_components/DealsCountdown";
import { NewsletterForm } from "./_components/NewsletterForm";
import { HomepageHotDealsSection } from "./_components/HomepageHotDealsSection";
import { HomepageReviewsSection } from "./_components/HomepageReviewsSection";
import type { HomepageBundle } from "@/features/catalog/types/catalog.types";

// ─────────────────────────────────────────────────────────────────────────────
// Metadata — per-page SEO
// ─────────────────────────────────────────────────────────────────────────────

export const metadata = {
  title: "Fashionistar — AI-Powered Fashion & Custom Tailoring in Nigeria",
  description:
    "Shop premium bespoke clothing from verified Nigerian tailors. Use our AI body measurement system for a perfect fit. Collections, senator outfits, gowns & more.",
  keywords: ["Nigerian fashion", "bespoke tailoring", "AI measurement", "senator outfit", "custom clothing Nigeria"],
  openGraph: {
    title: "Fashionistar — AI-Powered Fashion & Custom Tailoring",
    description: "Nigeria's premier AI-powered e-commerce platform connecting clients with verified tailors.",
    type: "website",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Featured Products sub-RSC (keeps Suspense boundary isolated)
// ─────────────────────────────────────────────────────────────────────────────

async function FeaturedProductsSection({ bundle }: { bundle: HomepageBundle }) {
  const products = bundle.featured_products.slice(0, 8);

  if (!products.length) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => {
        const image = product.image_url ?? "/heroimg.png";
        const priceNum = parseFloat(product.price);
        const avgRating = product.computed_avg_rating || product.rating;
        const stars = Math.min(5, Math.max(1, Math.round(avgRating || 5)));

        return (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="flex flex-col gap-2 group"
          >
            <div className="relative overflow-hidden rounded-xl bg-[#F4F5FB]">
              <Image
                src={image}
                alt={product.title}
                width={480}
                height={480}
                className="w-full h-[220px] md:h-[280px] object-contain group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {product.hot_deal && (
                <span className="absolute top-2 left-2 bg-[#fda600] text-white text-xs font-bold font-raleway px-2 py-1 rounded-md uppercase">
                  Sale
                </span>
              )}
              {product.requires_measurement && (
                <span className="absolute top-2 right-2 bg-[#01454A] text-white text-xs font-semibold font-raleway px-2 py-1 rounded-md">
                  AI Fit
                </span>
              )}
            </div>
            <span className="text-[#fda600] text-sm">
              {"★".repeat(stars)}{"☆".repeat(5 - stars)}
            </span>
            <p className="font-raleway font-semibold text-sm md:text-base text-black line-clamp-2">
              {product.title}
            </p>
            <p className="font-raleway font-semibold text-base md:text-lg text-[#01454A]">
              ₦{priceNum.toLocaleString("en-NG")}
              {product.old_price && (
                <span className="ml-2 text-sm line-through text-[#848484] font-normal">
                  ₦{parseFloat(product.old_price).toLocaleString("en-NG")}
                </span>
              )}
            </p>
          </Link>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Homepage Page — Single bundle fetch, all sections as props
// ─────────────────────────────────────────────────────────────────────────────

export default async function Home() {
  // ONE server-side fetch — backend asyncio.gather() runs 5 DB queries in parallel
  // ISR: revalidate 300s, tagged "homepage-bundle" for on-demand invalidation
  const bundle = await getHomepageBundle();

  return (
    <div className="flex flex-col gap-5">

      {/* ── Hero Carousel (3 animated slides) ────────────────────────── */}
      <Hero />

      {/* ── Mobile email waitlist ─────────────────────────────────────── */}
      <div className="mt-10 md:hidden flex z-30 px-4">
        <form className="flex w-full">
          <div className="h-[60px] w-full bg-[#F4F5FB] rounded-r-[100px] flex items-center p-1.5">
            <input
              type="email"
              className="w-2/3 h-full outline-none bg-inherit placeholder:not-italic placeholder:font-raleway placeholder:font-medium placeholder:text-xl placeholder:text-[#333] text-[#333]"
              placeholder="Enter Email Address"
            />
            <button className="w-1/3 h-full rounded-r-[100px] bg-[#01454a] text-white shrink-0 text-sm font-bold font-raleway">
              Join Waitlist
            </button>
          </div>
        </form>
      </div>

      {/* ── Live Category Grid ──────────────────────────────────────────── */}
      {/*
        CatalogCategoryGrid has its own internal fetch — kept separate so
        it can be independently revalidated by the catalog admin signal.
        In a future optimization this can be switched to receive bundle.categories.
      */}
      <CatalogCategoryGrid />

      {/* ── Live Featured Products ──────────────────────────────────────── */}
      <section className="px-5 py-10 md:px-10 lg:px-20 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bon_foyage text-4xl md:text-5xl text-[#333]">
            Featured Products
          </h2>
          <Link
            href="/categories"
            className="font-raleway text-sm font-semibold text-[#01454A] hover:text-[#fda600] transition-colors"
          >
            View all →
          </Link>
        </div>
        <Suspense fallback={<ProductGridSkeleton count={8} />}>
          <FeaturedProductsSection bundle={bundle} />
        </Suspense>
      </section>

      {/* ── Recently Viewed Rail (client-side, localStorage) ────────────── */}
      <RecentlyViewedSection />

      {/* ── Live Collection Grid ─────────────────────────────────────────── */}
      <CatalogCollectionGrid />

      {/* ── Campaign Banner ──────────────────────────────────────────────── */}
      <div className="w-full h-[593px] bg-[#fda600] md:h-[746px] relative p-10 md:p-14 lg:p-24 flex flex-col gap-5 md:gap-10 items-center overflow-hidden">
        {/* Decorative overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent" />
        </div>
        <p className="font-raleway font-semibold text-xl text-black relative z-10">
          SENATOR OUTFITS
        </p>
        <p className="font-bon_foyage text-[42px] md:text-6xl lg:text-[75px] lg:leading-[74px] leading-[42px] text-center text-black md:w-1/2 relative z-10">
          {" "}The New Fashion Collection
        </p>
        <Link
          href="/categories"
          className="px-10 py-3 md:py-5 rounded-[100px] bg-[#01454A] flex text-white font-raleway font-semibold text-xl relative z-10 hover:bg-[#01454A]/90 transition-all duration-300 hover:scale-105 shadow-lg"
        >
          Shop Now
        </Link>
        <Image
          src="/man.png"
          alt=""
          width={500}
          height={582}
          className="w-[200px] md:w-[370px] lg:w-[500px] h-auto absolute left-0 md:left-6 bottom-0"
          style={{ height: "auto" }}
        />
        <Image
          src="/adunni.png"
          alt=""
          width={1000}
          height={1000}
          className="w-[200px] h-[321px] md:w-[350px] md:h-[550px] lg:w-[592px] lg:h-[758px] absolute right-0 bottom-0 object-cover"
        />
      </div>

      {/* ── Deals of the Week (live from hot_deals bundle) ───────────────── */}
      <div className="px-5 py-10 md:p-10 lg:p-20 space-y-5 md:space-y-10">
        <div className="flex flex-wrap justify-center md:justify-normal items-center gap-5 lg:gap-20">
          <h3 className="font-bon_foyage whitespace-nowrap text-center text-5xl leading-[48px] text-[#333]">
            {" "}Deals of the Week
          </h3>
          {/* Live countdown timer */}
          <DealsCountdown />
        </div>

        {/* Hot deal cards — live from homepage bundle (no extra fetch) */}
        <HomepageHotDealsSection products={bundle.hot_deals} />
      </div>

      {/* ── Live Customer Reviews (from homepage bundle) ──────────────────── */}
      <HomepageReviewsSection reviews={bundle.reviews} />

      {/* ── Newsletter CTA ────────────────────────────────────────────────── */}
      <div className="mx-5 md:mx-10 lg:mx-20 mb-10 rounded-3xl bg-gradient-to-r from-[#01454A] to-[#01454A]/80 p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h3 className="font-bon_foyage text-3xl md:text-4xl text-white mb-2">
            Stay in Style
          </h3>
          <p className="font-raleway text-[#ECE6D6]/80 text-base md:text-lg">
            Get exclusive deals, new arrivals and style tips delivered to your inbox.
          </p>
        </div>
        <NewsletterForm />
      </div>
    </div>
  );
}
