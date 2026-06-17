/**
 * features/catalog/components/HomepageFeaturedProducts.tsx — C2 (v2)
 *
 * Standalone RSC for the Featured Products section on the homepage.
 * Extracted from inline page.tsx so it can be independently Suspense-wrapped
 * and cache-tagged ("featured-products").
 *
 * Migrated from next/image → FashionistarImage (Phase 2 overhaul). * Props:
 *   bundle — HomepageBundle passed from page.tsx (zero extra fetch)
 *
 * Design: 2-col mobile → 3-col tablet → 4-col desktop
 *         Product card: image, sale/AI-Fit badge, star rating, title, price
 */

import Link from "next/link";
import { FashionistarImage } from "@/components/media";
import type { HomepageBundle, HomepageProductCard } from "../types/catalog.types";

interface Props {
  bundle: HomepageBundle;
  limit?: number;
}

function StarRating({ rating }: { rating: number }) {
  const stars = Math.min(5, Math.max(1, Math.round(rating || 5)));
  return (
    <span
      className="text-[#fda600] text-sm leading-none"
      aria-label={`${stars} out of 5 stars`}
    >
      {"★".repeat(stars)}
      {"☆".repeat(5 - stars)}
    </span>
  );
}

function ProductCard({ product }: { product: HomepageProductCard }) {
  const priceNum = parseFloat(product.price);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="flex flex-col gap-2 group"
      data-testid="product-card"
    >
      {/* ── Image container ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-xl bg-[#F4F5FB] aspect-square">
        {/* FashionistarImage fill — parent is relative + aspect-square */}
        <FashionistarImage
          src={product.image_url || null}
          alt={product.title}
          fill
          transformation="card"
          objectFit="contain"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          imgClassName="p-2 group-hover:scale-105 transition-transform duration-500"
        />

        {/* ── Badges ────────────────────────────────────────────────── */}
        {product.hot_deal && (
          <span className="absolute top-2 left-2 bg-[#fda600] text-white text-[10px] font-bold font-raleway px-2 py-0.5 rounded-md uppercase tracking-wide z-10">
            Sale
          </span>
        )}
        {product.requires_measurement && (
          <span className="absolute top-2 right-2 bg-[#01454A] text-white text-[10px] font-semibold font-raleway px-2 py-0.5 rounded-md z-10">
            AI Fit
          </span>
        )}
        {product.discount_percentage > 0 && !product.hot_deal && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold font-raleway px-2 py-0.5 rounded-md z-10">
            -{product.discount_percentage}%
          </span>
        )}
      </div>

      {/* ── Rating ────────────────────────────────────────────────────── */}
      <StarRating rating={product.computed_avg_rating || product.rating} />

      {/* ── Title ─────────────────────────────────────────────────────── */}
      <p className="font-raleway font-semibold text-sm md:text-base text-black line-clamp-2 leading-snug">
        {product.title}
      </p>

      {/* ── Price row ─────────────────────────────────────────────────── */}
      <p className="font-raleway font-semibold text-base md:text-lg text-[#01454A]">
        ₦{priceNum.toLocaleString("en-NG")}
        {product.old_price && (
          <span className="ml-2 text-sm line-through text-[#848484] font-normal">
            ₦{parseFloat(product.old_price).toLocaleString("en-NG")}
          </span>
        )}
      </p>

      {/* ── Vendor name ───────────────────────────────────────────────── */}
      {product.store_name && (
        <p className="font-raleway text-xs text-[#848484] -mt-1">{product.store_name}</p>
      )}
    </Link>
  );
}

export function HomepageFeaturedProducts({ bundle, limit = 8 }: Props) {
  const products = bundle.featured_products.slice(0, limit);

  if (!products.length) {
    return (
      <div
        className="text-center py-12 text-[#848484] font-raleway"
        data-testid="featured-products-empty"
      >
        Featured products coming soon.
      </div>
    );
  }

  return (
    <section
      className="px-5 py-10 md:px-10 lg:px-20 space-y-6"
      aria-label="Featured Products"
      data-testid="featured-products-section"
    >
      {/* ── Section header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h2 className="font-bon_foyage text-4xl md:text-5xl text-[#333]">Featured Products</h2>
        <Link
          href="/categories"
          className="font-raleway text-sm font-semibold text-[#01454A] hover:text-[#fda600] transition-colors duration-200"
        >
          View all →
        </Link>
      </div>

      {/* ── Product grid — 2-col mobile, 3-col tablet, 4-col desktop ───── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 lg:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
