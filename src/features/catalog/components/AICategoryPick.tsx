"use client";

/**
 * @file AICategoryPick.tsx
 * @description AI-powered personalized product pick for a category.
 *
 * Psychological triggers:
 *   - Authority: "AI Pick: Based on your style preferences"
 *   - Personalization: Tailored recommendation
 *   - Social Proof: Best-seller fallback for anonymous users
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Star } from "lucide-react";
import { apiAsync } from "@/core/api/client.async";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { FashionistarImage } from "@/components/media";
import { formatCurrency } from "@/lib/formatting";

interface AIPickProduct {
  id: string;
  title: string;
  slug: string;
  price: string;
  currency: string;
  image_url: string | null;
  cloudinary_url: string | null;
  computed_avg_rating: number;
  computed_review_count: number;
}

interface AICategoryPickProps {
  categorySlug: string;
  categoryName: string;
}

export function AICategoryPick({ categorySlug, categoryName }: AICategoryPickProps) {
  const [product, setProduct] = useState<AIPickProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    let active = true;
    const fetchPick = async () => {
      try {
        const endpoint = accessToken
          ? `recommendations/category-pick/${categorySlug}/`
          : `products/`;
        const searchParams = accessToken
          ? undefined
          : { category: categorySlug, sort: "best_selling", page_size: "1" };

        const res = await apiAsync
          .get(endpoint, searchParams ? { searchParams } : undefined)
          .json<{ results?: AIPickProduct[] } | AIPickProduct>();

        const pick = Array.isArray(res)
          ? res[0]
          : (res as AIPickProduct).id
            ? (res as AIPickProduct)
            : (res as { results: AIPickProduct[] }).results?.[0];

        if (active && pick) setProduct(pick);
      } catch {
        // Silent fail — AI pick is optional enhancement
      } finally {
        if (active) setLoading(false);
      }
    };
    void fetchPick();
    return () => { active = false; };
  }, [categorySlug, accessToken]);

  if (loading || !product) return null;

  return (
    <section
      className="border-b border-border/50 bg-gradient-to-br from-purple-50/50 to-blue-50/50"
      data-testid="ai-category-pick"
    >
      <div className="px-5 py-6 md:px-10 lg:px-20">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-purple-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
            {accessToken ? "AI Pick — Based on your style" : `Best Seller in ${categoryName}`}
          </span>
        </div>
        <Link
          href={`/products/${product.slug}`}
          className="group flex flex-col gap-4 rounded-2xl border border-purple-100 bg-white p-4 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center"
        >
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted sm:w-28 sm:h-28">
            {product.image_url || product.cloudinary_url ? (
              <FashionistarImage
                src={product.cloudinary_url ?? product.image_url!}
                alt={product.title}
                fill
                sizes="112px"
                className="h-full w-full"
                imgClassName="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Sparkles className="h-8 w-8 text-muted/30" />
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <p className="font-semibold text-foreground">{product.title}</p>
            {product.computed_avg_rating > 0 && (
              <div className="flex items-center gap-1">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                <span className="text-xs font-semibold text-foreground">
                  {product.computed_avg_rating.toFixed(1)}
                </span>
                {product.computed_review_count > 0 && (
                  <span className="text-xs text-muted-foreground">
                    ({product.computed_review_count} reviews)
                  </span>
                )}
              </div>
            )}
            <span className="text-lg font-bold text-[#01454A]">
              {formatCurrency(parseFloat(product.price), product.currency || "NGN")}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-600 px-4 py-2 text-xs font-semibold text-white transition group-hover:bg-purple-700">
            View Product
          </span>
        </Link>
      </div>
    </section>
  );
}
