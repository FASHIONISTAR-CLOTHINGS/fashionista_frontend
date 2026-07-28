"use client";

/**
 * @file CategoryTrendingRail.tsx
 * @description Horizontal scroll rail showing top trending products in a category.
 *
 * Psychological triggers:
 *   - Social Proof: "See how these are trending"
 *   - FOMO: Trending implies high demand
 *   - Authority: AI-driven trend scores
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Flame, ChevronLeft, ChevronRight } from "lucide-react";
import { apiAsync } from "@/core/api/client.async";
import { FashionistarImage } from "@/components/media";
import { formatCurrency } from "@/lib/formatting";

interface TrendingProduct {
  id: string;
  title: string;
  slug: string;
  price: string;
  currency: string;
  image_url: string | null;
  cloudinary_url: string | null;
  ai_trend_score: number;
}

interface CategoryTrendingRailProps {
  categorySlug: string;
  categoryName: string;
}

export function CategoryTrendingRail({ categorySlug, categoryName }: CategoryTrendingRailProps) {
  const [products, setProducts] = useState<TrendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    const fetchTrending = async () => {
      try {
        const res = await apiAsync
          .get(`products/`, {
            searchParams: { category: categorySlug, sort: "trending", page_size: "6" },
          })
          .json<{ results: TrendingProduct[] }>();
        if (active && res.results) {
          setProducts(res.results.slice(0, 6));
        }
      } catch {
        // Silent fail — trending rail is optional
      } finally {
        if (active) setLoading(false);
      }
    };
    void fetchTrending();
    return () => { active = false; };
  }, [categorySlug]);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -220 : 220, behavior: "smooth" });
  };

  if (loading || products.length === 0) return null;

  return (
    <section
      className="border-b border-border/50 bg-white"
      data-testid="category-trending-rail"
      aria-label={`Trending in ${categoryName}`}
    >
      <div className="flex items-center justify-between px-5 pt-7 pb-4 md:px-10 lg:px-20">
        <div className="flex items-center gap-2">
          <Flame size={18} className="text-orange-500" />
          <h2 className="font-bon_foyage text-xl text-foreground md:text-2xl">
            Trending in {categoryName}
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted"
            aria-label="Scroll left"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted"
            aria-label="Scroll right"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto branded-scroll pb-6" ref={scrollRef}>
        <div className="flex gap-3 px-5 md:px-10 lg:px-20 w-max">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group flex w-[180px] flex-col gap-2 rounded-xl border border-border/40 bg-card p-3 shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
                {product.image_url || product.cloudinary_url ? (
                  <FashionistarImage
                    src={product.cloudinary_url ?? product.image_url!}
                    alt={product.title}
                    fill
                    sizes="180px"
                    className="h-full w-full"
                    imgClassName="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Flame className="h-8 w-8 text-muted/30" />
                  </div>
                )}
                {product.ai_trend_score > 0.7 && (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-0.5 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    <Flame size={8} /> Hot
                  </span>
                )}
              </div>
              <p className="line-clamp-1 text-xs font-semibold text-foreground">{product.title}</p>
              <span className="text-sm font-bold text-[#01454A]">
                {formatCurrency(parseFloat(product.price), product.currency || "NGN")}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
