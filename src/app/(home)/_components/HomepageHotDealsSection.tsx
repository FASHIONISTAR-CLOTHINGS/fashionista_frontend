/**
 * HomepageHotDealsSection.tsx — React Server Component
 *
 * Renders the "Deals of the Week" product grid using live hot-deal products
 * sourced from the homepage bundle. Data is passed as a prop from page.tsx
 * which calls getHomepageBundle() once for all sections.
 *
 * Architecture:
 *   - Pure RSC — no "use client" directive.
 *   - Receives HomepageProductCard[] as a prop (no re-fetch).
 *   - Cloudinary image URL has w_480,h_480,c_fill transform applied by backend.
 *   - Stars rendered from rating field (float → rounded integer, 1–5).
 *   - Falls back to placeholder message when products array is empty.
 */

import Link from "next/link";
import Image from "next/image";
import type { HomepageProductCard } from "@/features/catalog/types/catalog.types";

interface Props {
  products: HomepageProductCard[];
}

function StarRating({ rating }: { rating: number }) {
  const stars = Math.min(5, Math.max(1, Math.round(rating || 5)));
  return (
    <span className="text-[#fda600] text-lg" aria-label={`${stars} out of 5 stars`}>
      {"★".repeat(stars)}{"☆".repeat(5 - stars)}
    </span>
  );
}

function DealCard({ product }: { product: HomepageProductCard }) {
  const image = product.image_url ?? "/heroimg.png";
  const priceNum = parseFloat(product.price);
  const oldPriceNum = product.old_price ? parseFloat(product.old_price) : null;
  const discountPct = product.discount_percentage
    ? product.discount_percentage
    : oldPriceNum && priceNum < oldPriceNum
      ? Math.round(((oldPriceNum - priceNum) / oldPriceNum) * 100)
      : 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="flex flex-col w-[45%] md:w-[32%] max-w-[300px] group"
    >
      {/* Product Image */}
      <div className="relative overflow-hidden rounded-[8px]">
        <Image
          src={image}
          className="w-full h-[220px] md:h-[350px] object-contain group-hover:scale-105 transition-transform duration-500"
          alt={product.title}
          width={480}
          height={480}
          sizes="(max-width: 768px) 45vw, 30vw"
        />
        {/* Hot Deal Badge */}
        {product.hot_deal && (
          <div className="absolute top-7 left-2 md:top-10 flex flex-col gap-1">
            <p className="w-[83px] h-7 rounded-[5px] flex items-center justify-center uppercase bg-[#fda600] text-white font-semibold font-raleway text-xs">
              sale
            </p>
            {discountPct > 0 && (
              <p className="w-[83px] h-7 rounded-[5px] flex items-center justify-center bg-[#01454A] text-white font-semibold font-raleway text-xs">
                -{discountPct}%
              </p>
            )}
          </div>
        )}
        {/* Out of stock overlay */}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-[8px]">
            <span className="bg-white/90 text-[#333] font-raleway font-semibold text-sm px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col gap-2 pt-3">
        <StarRating rating={product.computed_avg_rating || product.rating} />
        <p className="font-raleway font-semibold text-base md:text-xl text-black line-clamp-2">
          {product.title}
        </p>
        {product.category_name && (
          <p className="font-raleway text-xs text-[#848484] uppercase tracking-wide">
            {product.category_name}
          </p>
        )}
        <div className="flex items-center gap-2">
          <p className="font-raleway font-semibold text-lg md:text-xl text-[#01454A]">
            ₦{priceNum.toLocaleString("en-NG")}
          </p>
          {oldPriceNum && (
            <p className="font-raleway md:text-lg line-through text-[#848484]">
              ₦{oldPriceNum.toLocaleString("en-NG")}
            </p>
          )}
        </div>
        {product.requires_measurement && (
          <span className="text-xs font-raleway text-[#01454A] bg-[#01454A]/10 px-2 py-0.5 rounded-full w-fit">
            AI Measured
          </span>
        )}
      </div>
    </Link>
  );
}

export function HomepageHotDealsSection({ products }: Props) {
  if (!products || products.length === 0) {
    return (
      <p className="text-[#848484] font-raleway text-center py-8">
        New deals dropping soon — check back later!
      </p>
    );
  }

  const displayProducts = products.slice(0, 3);

  return (
    <div className="flex items-start flex-wrap gap-y-6 md:gap-3 lg:gap-6 justify-between">
      {displayProducts.map((product) => (
        <DealCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default HomepageHotDealsSection;
