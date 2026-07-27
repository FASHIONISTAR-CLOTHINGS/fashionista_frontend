"use client";

/**
 * @file CartUpsellCarousel.tsx
 * @description AI-powered "Complete your look" upsell carousel for cart page.
 *
 * Psychological triggers:
 *   - Reciprocity: Helpful suggestions enhance shopping experience
 *   - Authority: AI-powered recommendations feel personalized
 *   - Commitment: One-click add reduces friction for additional purchase
 */

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Sparkles, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { apiAsync } from "@/core/api/client.async";
import { FashionistarImage } from "@/components/media";
import { formatCurrency } from "@/lib/formatting";
import { useAddCartItem } from "@/features/cart/hooks/use-cart";
import { toast } from "sonner";

interface UpsellProduct {
  id: string;
  title: string;
  slug: string;
  price: string;
  currency: string;
  image_url: string | null;
  cloudinary_url: string | null;
}

interface CartUpsellCarouselProps {
  cartItemSlugs: string[];
}

export function CartUpsellCarousel({ cartItemSlugs }: CartUpsellCarouselProps) {
  const [products, setProducts] = useState<UpsellProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { mutate: addToCart } = useAddCartItem();

  useEffect(() => {
    let active = true;
    const fetchUpsell = async () => {
      if (!cartItemSlugs.length) {
        setLoading(false);
        return;
      }
      try {
        const slug = cartItemSlugs[0];
        const res = await apiAsync
          .get(`products/${slug}/cross-sell/`)
          .json<{ results: UpsellProduct[] }>();
        if (active && res.results) {
          setProducts(res.results.slice(0, 6));
        }
      } catch {
        // Silent fail — upsell is optional enhancement
      } finally {
        if (active) setLoading(false);
      }
    };
    void fetchUpsell();
    return () => { active = false; };
  }, [cartItemSlugs]);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -200 : 200,
      behavior: "smooth",
    });
  };

  const handleQuickAdd = (productId: string, productSlug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(
      { product_id: productId, product_slug: productSlug, quantity: 1 },
      {
        onSuccess: () => toast.success("Added to cart!"),
        onError: () => toast.error("Could not add — please try again."),
      },
    );
  };

  if (loading || products.length === 0) return null;

  return (
    <div
      className="rounded-2xl border border-border bg-card p-5 shadow-[var(--card-shadow)]"
      data-testid="cart-upsell-carousel"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="inline-flex items-center gap-2 text-base font-bold text-foreground">
          <Sparkles size={16} className="text-[#FDA600]" />
          Complete Your Look
        </h3>
        <p className="text-[10px] text-muted-foreground">AI-powered recommendations</p>
      </div>

      <div className="relative">
        {/* Scroll buttons */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white transition"
          aria-label="Scroll left"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white transition"
          aria-label="Scroll right"
        >
          <ChevronRight size={16} />
        </button>

        {/* Scrollable rail */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scroll-smooth pb-2 px-1"
          style={{ scrollbarWidth: "none" }}
        >
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/products/${p.slug}`}
              className="group flex-shrink-0 w-36 rounded-xl border border-border overflow-hidden hover:shadow-md transition"
            >
              <div className="relative aspect-square bg-muted">
                {p.cloudinary_url || p.image_url ? (
                  <FashionistarImage
                    src={p.cloudinary_url || p.image_url || ""}
                    alt={p.title}
                    fill
                    sizes="144px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : null}
              </div>
              <div className="p-2">
                <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">{p.title}</p>
                <p className="text-sm font-bold text-[#FDA600] mt-0.5">
                  {formatCurrency(parseFloat(p.price), p.currency || "NGN")}
                </p>
                <button
                  onClick={(e) => handleQuickAdd(p.id, p.slug, e)}
                  className="mt-1.5 w-full inline-flex items-center justify-center gap-1 rounded-lg bg-[#01454A] text-white text-[10px] font-bold py-1.5 hover:bg-[#0a6b72] transition"
                >
                  <ShoppingBag size={10} />
                  Add
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
