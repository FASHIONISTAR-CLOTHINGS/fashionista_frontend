/**
 * @file QuickViewModal.tsx
 * @description Enterprise Quick-View modal for product grids (R24).
 *
 * Displays high-resolution gallery, price, size selector, quick add to cart,
 * AI measurement badge/CTA, and direct link to full Product Detail Page.
 *
 * @version 2026-enterprise
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { X, Heart, ShoppingBag, Ruler, Check, Star, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FashionistarImage } from "@/components/media";
import { formatCurrency } from "@/lib/formatting";
import { useAddCartItem } from "@/features/cart/hooks/use-cart";
import { toast } from "sonner";
import type { HomepageProductCard } from "@/features/catalog/types/catalog.types";
import type { ProductListItem } from "@/features/product/types/product.types";

interface QuickViewModalProps {
  product: HomepageProductCard | ProductListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onWishlistToggle?: (slug?: string) => void;
  isWishlisted?: boolean;
}

export function QuickViewModal({
  product,
  isOpen,
  onClose,
  onWishlistToggle,
  isWishlisted = false,
}: QuickViewModalProps) {
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [selectedSize, setSelectedSize] = React.useState<string | null>(null);
  const { mutate: addToCart, isPending: cartPending } = useAddCartItem();

  React.useEffect(() => {
    if (product) {
      const raw = product as unknown as Record<string, unknown>;
      const mainImg = (raw.cloudinary_url as string) || product.image_url || null;
      setSelectedImage(mainImg);
      setSelectedSize(null);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const title = product.title || "Fashion Product";
  const price = typeof product.price === "number" ? product.price : parseFloat(String(product.price || 0));
  const oldPrice = product.old_price ? (typeof product.old_price === "number" ? product.old_price : parseFloat(String(product.old_price))) : null;
  const vendorName = product.vendor_name || "Fashionistar Verified";
  const requiresMeasurement = Boolean(product.requires_measurement);
  const inStock = product.in_stock ?? true;

  // Gallery image list (up to 4 thumbnails)
  const images: string[] = [];
  const rawObj = product as unknown as Record<string, unknown>;
  if (rawObj.cloudinary_url) images.push(rawObj.cloudinary_url as string);
  if (product.image_url && !images.includes(product.image_url)) images.push(product.image_url);
  if (Array.isArray(rawObj.images)) {
    (rawObj.images as Array<string | { image_url?: string; url?: string }>).forEach((img) => {
      const url = typeof img === "string" ? img : img.image_url || img.url;
      if (url && !images.includes(url)) images.push(url);
    });
  }
  if (images.length === 0) images.push("/placeholder-fashion.jpg");

  const activeImage = selectedImage || images[0];

  const handleAddToCart = () => {
    addToCart(
      { product_id: String(product.id), product_slug: product.slug, quantity: 1 },
      {
        onSuccess: () => {
          toast.success(`${title} added to cart`, {
            description: selectedSize ? `Size: ${selectedSize}` : undefined,
          });
          onClose();
        },
        onError: () => toast.error("Could not add to cart — please try again."),
      },
    );
  };

  const handleWishlist = () => {
    if (onWishlistToggle) {
      onWishlistToggle(product.slug);
    }
  };

  const sizes = ["S", "M", "L", "XL", "XXL", "Bespoke"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-background rounded-2xl border border-border/50 shadow-2xl overflow-hidden flex flex-col md:flex-row overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label={`${title} Quick View`}
      >
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-30 h-9 w-9 rounded-full bg-background/80 backdrop-blur-md border border-border/40 hover:bg-muted text-foreground"
          aria-label="Close modal"
        >
          <X size={18} />
        </Button>

        {/* Left: Gallery */}
        <div className="w-full md:w-1/2 p-6 bg-muted/20 flex flex-col items-center justify-between gap-4">
          <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-muted/40 shadow-inner">
            <FashionistarImage
              src={activeImage}
              alt={title}
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 400px"
            />

            {requiresMeasurement && (
              <div className="absolute top-3 left-3 bg-[#01454A] text-white px-3 py-1.5 rounded-full text-xs font-semibold font-raleway flex items-center gap-1.5 shadow-md">
                <Ruler size={13} className="text-[#FDA600]" />
                <span>AI Measurement Required</span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto py-1 w-full justify-center">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-16 h-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    activeImage === img ? "border-[#01454A] scale-105 shadow-sm" : "border-border/50 opacity-70 hover:opacity-100"
                  }`}
                >
                  <FashionistarImage src={img} alt={`${title} view ${idx + 1}`} fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product details & actions */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#01454A]">
                {vendorName}
              </span>
              {(rawObj.rating || rawObj.computed_avg_rating) ? (
                <div className="flex items-center gap-1 text-amber-500 text-xs font-medium">
                  <Star size={14} className="fill-amber-500" />
                  <span>{Number(rawObj.rating ?? rawObj.computed_avg_rating ?? 0).toFixed(1)}</span>
                </div>
              ) : null}
            </div>

            <h2 className="font-bon_foyage text-2xl md:text-3xl text-foreground mb-3 leading-snug">
              {title}
            </h2>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl font-bold font-raleway text-[#01454A] dark:text-[#FDA600]">
                {formatCurrency(price)}
              </span>
              {oldPrice && oldPrice > price && (
                <span className="text-sm font-medium line-through text-muted-foreground">
                  {formatCurrency(oldPrice)}
                </span>
              )}
              {oldPrice && oldPrice > price && (
                <span className="text-xs font-bold bg-[#FDA600]/20 text-[#01454A] dark:text-[#FDA600] px-2 py-0.5 rounded-full">
                  SAVE {Math.round(((oldPrice - price) / oldPrice) * 100)}%
                </span>
              )}
            </div>

            {/* Size selector */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between text-xs font-semibold font-raleway">
                <span>Select Size</span>
                <Link href="/get-measured" onClick={onClose} className="text-[#01454A] dark:text-[#FDA600] hover:underline flex items-center gap-1">
                  <Ruler size={12} /> Size Guide / Scan
                </Link>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {sizes.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`h-10 rounded-lg text-xs font-bold font-raleway border transition-all ${
                      selectedSize === sz
                        ? "bg-[#01454A] text-white border-[#01454A] shadow-md"
                        : "border-border/60 hover:border-[#01454A] text-foreground bg-background"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Trust signals */}
            <div className="grid grid-cols-2 gap-2 py-3 border-y border-border/40 text-xs text-muted-foreground font-raleway mb-6">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-[#01454A]" />
                <span>100% Authentic Fabric</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check size={15} className="text-[#01454A]" />
                <span>Verified Bespoke Tailor</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={!inStock || cartPending}
                className="flex-1 h-12 rounded-xl bg-[#01454A] text-white font-bold font-raleway hover:bg-[#01454A]/90 transition-all shadow-md gap-2 disabled:opacity-60"
              >
                <ShoppingBag size={18} />
                {cartPending ? "Adding…" : inStock ? "Add to Shopping Cart" : "Out of Stock"}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={handleWishlist}
                className={`h-12 w-12 rounded-xl border-border/60 shrink-0 transition-colors ${
                  isWishlisted ? "text-rose-500 border-rose-200 bg-rose-50" : "hover:text-rose-500"
                }`}
                aria-label="Save to Wishlist"
              >
                <Heart size={20} className={isWishlisted ? "fill-rose-500" : ""} />
              </Button>
            </div>

            <Link
              href={`/products/${product.slug}`}
              onClick={onClose}
              className="w-full h-10 rounded-xl border border-border/60 hover:border-[#01454A] flex items-center justify-center gap-2 text-xs font-bold font-raleway text-foreground transition-all hover:bg-muted/30"
            >
              <span>View Full Product Details</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
