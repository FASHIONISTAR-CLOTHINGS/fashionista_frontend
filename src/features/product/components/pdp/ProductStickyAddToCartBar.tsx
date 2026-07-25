"use client";

/**
 * @file ProductStickyAddToCartBar.tsx
 * @description Persistent mobile bottom CTA bar appearing when main Add-to-Cart button scrolls out of view.
 */

import { useEffect, useState } from "react";
import { ShoppingBag, Heart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ProductStickyAddToCartBarProps {
  title: string;
  price: number;
  currency?: string;
  inStock: boolean;
  cartLoading: boolean;
  mainButtonRef: React.RefObject<HTMLButtonElement | null>;
  onAddToCart: () => void;
  onToggleWishlist: () => void;
}

export function ProductStickyAddToCartBar({
  title,
  price,
  currency = "NGN",
  inStock,
  cartLoading,
  mainButtonRef,
  onAddToCart,
  onToggleWishlist,
}: ProductStickyAddToCartBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = mainButtonRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky bar when main button is NOT intersecting (scrolled past)
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [mainButtonRef]);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between border-t border-border bg-card/95 px-4 py-3 shadow-2xl backdrop-blur-md transition-all duration-300 md:hidden animate-slide-up"
      data-testid="pdp-sticky-cart-bar"
    >
      <div className="flex flex-col min-w-0 pr-3">
        <span className="truncate text-xs font-semibold text-foreground">{title}</span>
        <span className="text-sm font-bold text-[#FDA600]">
          {formatCurrency(price, currency)}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleWishlist}
          aria-label="Wishlist"
          className="h-10 w-10 rounded-xl"
        >
          <Heart size={18} />
        </Button>

        <Button
          onClick={onAddToCart}
          disabled={!inStock || cartLoading}
          className="flex items-center gap-1.5 rounded-xl bg-[#FDA600] px-4 py-2.5 text-xs font-bold text-[#1A1208] hover:bg-[#e09500] disabled:opacity-50"
        >
          {cartLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
          ) : (
            <>
              <ShoppingBag size={14} />
              Add to Cart
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
