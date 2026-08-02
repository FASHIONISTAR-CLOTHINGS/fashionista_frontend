"use client";

/**
 * @file PersonalizedRail.tsx
 * @description "Recommended for You" product rail on the homepage.
 *
 * Psychological triggers:
 *   - Personalization: Tailored to user's browsing/purchase history
 *   - Reciprocity: Platform curates items for the user
 *   - FOMO: "Popular Right Now" for anonymous users
 *
 * Behavior:
 *   - Authenticated users: fetches AI recommendations from /recommendations/for-you/
 *   - Anonymous users: falls back to "Popular Right Now" (top viewed in 24h)
 *   - Horizontal scrollable rail with product cards
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, TrendingUp, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { apiAsync } from "@/core/api/client.async";
import { FashionistarImage } from "@/components/media/FashionistarImage";
import { formatCurrency } from "@/lib/utils";
import type { HomepageProductCard } from "@/features/catalog/types/catalog.types";

const FALLBACK_TITLE = "Popular Right Now";
const AUTH_TITLE = "Recommended for You";

export function PersonalizedRail() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [products, setProducts] = useState<HomepageProductCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchProducts = async () => {
      try {
        const endpoint = isAuthenticated
          ? "recommendations/for-you/?limit=8"
          : "products/?ordering=-views_count&page_size=8";
        const res = await apiAsync.get(endpoint).json<{
          results: HomepageProductCard[];
        }>();
        if (active && res.results?.length) {
          setProducts(res.results.slice(0, 8));
        }
      } catch {
        // Silent fail — rail just doesn't render
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchProducts();

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  if (!loading && products.length === 0) return null;

  const title = isAuthenticated ? AUTH_TITLE : FALLBACK_TITLE;

  return (
    <section
      className="px-5 py-10 md:px-10 lg:px-20"
      data-testid="personalized-rail"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Sparkles size={20} className="text-[#01454A]" />
          ) : (
            <TrendingUp size={20} className="text-[#01454A]" />
          )}
          <h2 className="font-bon_foyage text-2xl text-[#1A1208] md:text-3xl">
            {title}
          </h2>
        </div>
        <Link
          href="/products"
          className="flex items-center gap-1 text-sm font-medium text-[#01454A] hover:opacity-70 transition"
        >
          View all <ArrowRight size={14} />
        </Link>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="shrink-0 w-40 sm:w-48 animate-pulse rounded-2xl bg-muted/30"
              style={{ aspectRatio: "4/5" }}
            />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group shrink-0 w-40 snap-start sm:w-48"
            >
              <div className="relative overflow-hidden rounded-2xl bg-muted/10" style={{ aspectRatio: "4/5" }}>
                <FashionistarImage
                  src={product.cloudinary_url || product.image_url}
                  alt={product.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="192px"
                />
                {product.discount_percentage && product.discount_percentage > 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-[#FDA600] px-2 py-0.5 text-[10px] font-bold text-black">
                    -{product.discount_percentage}%
                  </span>
                )}
              </div>
              <div className="mt-2 space-y-1">
                <p className="line-clamp-1 text-xs font-medium text-[#1A1208]">
                  {product.title}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-[#01454A]">
                    {formatCurrency(product.price)}
                  </span>
                  {product.old_price && (
                    <span className="text-[10px] text-muted-foreground line-through">
                      {formatCurrency(product.old_price)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
