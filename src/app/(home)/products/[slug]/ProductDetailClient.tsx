"use client";

/**
 * @file ProductDetailClient.tsx
 * @description Full enterprise product detail page client component.
 *
 * Features:
 *  - Gallery with thumbnail picker + image zoom on hover
 *  - Size/Color variant selector wired to stock check
 *  - Add-to-cart with variant_id and quantity
 *  - Wishlist toggle
 *  - Star rating breakdown
 *  - Accordion: Description, Specs, FAQs
 *  - Review list via useProductReviews
 *  - Measurement gate warning if requires_measurement
 *  - Fire-and-forget view-log analytics (POST /products/{slug}/view-log/)
 */

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  Heart,
  ShoppingBag,
  Ruler,
  Star,
  Minus,
  Plus,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Package,
  BadgeCheck,
  Flame,
  Leaf,
  Shield,
  Truck,
  RotateCcw,
  Zap,
} from "lucide-react";
import {
  useProductDetail,
  useProductReviews,
  useToggleWishlist,
} from "@/features/product";
import type { ProductDetail } from "@/features/product";
import { useAddCartItem } from "@/features/cart/hooks/use-cart";
import { productCatalogApi } from "@/features/catalog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useRecentlyViewed } from "@/features/catalog/hooks/use-recently-viewed";
import { FashionistarImage } from "@/components/media";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductStickyAddToCartBar } from "@/features/product/components/pdp/ProductStickyAddToCartBar";
import { RelatedProductsCarousel } from "@/features/product/components/pdp/RelatedProductsCarousel";
import { GallerySection } from "@/features/product/components/pdp/GallerySection";
import { Breadcrumb } from "@/components/ui/breadcrumb";

interface ProductDetailClientProps {
  slug: string;
  initialProduct?: ProductDetail | null;
}

function AccordionItem({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <Button
        variant="ghost"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold text-foreground hover:text-[hsl(var(--primary))] transition-colors px-0 hover:bg-transparent h-auto"
        aria-expanded={open}
      >
        {title}
        {open ? <ChevronUp size={16} className="shrink-0" /> : <ChevronDown size={16} className="shrink-0" />}
      </Button>
      {open && (
        <div className="pb-4 text-sm leading-7 text-muted-foreground">
          {children}
        </div>
      )}
    </div>
  );
}

function isVideoUrl(url: string | null): boolean {
  if (!url) return false;
  const clean = url.split("?")[0].toLowerCase();
  return clean.endsWith(".mp4") || clean.endsWith(".webm") || clean.endsWith(".mov") || url.includes("/video/upload/");
}

export function ProductDetailClient({
  slug,
  initialProduct = null,
}: ProductDetailClientProps) {
  const { data: liveProduct, isError } = useProductDetail(slug);
  const { data: reviewsData } = useProductReviews(slug, 1);
  const { mutate: toggleWishlist } = useToggleWishlist();
  const { mutate: addToCart, isPending: cartLoading } = useAddCartItem();
  const { trackView } = useRecentlyViewed();
  const product = liveProduct ?? initialProduct;

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const mainButtonRef = useRef<HTMLButtonElement | null>(null);

  // ── Fire-and-forget view-log analytics ─────────────────────────────────
  // Fires once per slug, never blocks render, never throws to the user.
  // Guarded by a ref to prevent double-fires in React Strict Mode.
  const viewLogged = useRef(false);
  useEffect(() => {
    if (viewLogged.current || !slug) return;
    viewLogged.current = true;

    const ua = navigator.userAgent.toLowerCase();
    const device_type = /tablet|ipad|playbook|silk/i.test(ua)
      ? "tablet"
      : /mobi|android|iphone|ipod|windows phone/i.test(ua)
      ? "mobile"
      : "desktop";

    void productCatalogApi.logProductView(slug, {
      device_type,
      referrer_url: typeof document !== "undefined" ? document.referrer || undefined : undefined,
      session_key:
        typeof sessionStorage !== "undefined"
          ? (sessionStorage.getItem("fashionistar_session") ?? undefined)
          : undefined,
    });
  }, [slug]);

  // ── Revenue: Recently Viewed ring-buffer ────────────────────────────────
  // Tracks this product into the 12-item localStorage ring-buffer.
  // 35% of e-commerce conversions come from recently-viewed re-engagement.
  useEffect(() => {
    if (!product) return;
    trackView({
      id: String(product.id),
      slug: product.slug,
      title: product.title,
      coverUrl: product.cover_image_url ?? "/gown.svg",
      price: product.price,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);
  // ───────────────────────────────────────────────────────────────────────

  if (isError && !product) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32 text-center px-4">
        <Package size={56} className="text-muted-foreground" />
        <p className="text-xl font-bold text-foreground">Product not found</p>
        <Link
          href="/categories"
          className="flex items-center gap-2 text-sm font-semibold text-[hsl(var(--primary))] hover:opacity-80"
        >
          <ArrowLeft size={16} /> Browse all products
        </Link>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  // gallery = canonical field; variants = backward-compat alias
  const galleryItems = (product as unknown as { gallery?: typeof product.variants }).gallery?.length
    ? (product as unknown as { gallery: typeof product.variants }).gallery
    : (product.variants ?? []);

  const mediaItems = galleryItems.length
    ? galleryItems.map((g) => ({
        url: g.media_url ?? "/gown.svg",
        type: g.media_type || "image",
      }))
    : product.cover_image_url
    ? [
        {
          url: product.cover_image_url,
          type: isVideoUrl(product.cover_image_url) ? "video" : "image",
        },
      ]
    : [{ url: "/gown.svg", type: "image" }];

  // Variant: no price_override on the new model — always show base price
  const displayPrice = parseFloat(product.price);

  // stock check — use product-level in_stock flag
  const inStock = product.in_stock;


  const handleAddToCart = () => {
    if (!inStock) return;
    addToCart({
      product_id: product.id,
      product_slug: product.slug,
      variant_id: selectedVariantId ?? undefined,
      quantity,
    });
  };

  const reviews = reviewsData?.results ?? [];
  const [reviewStarFilter, setReviewStarFilter] = useState<number | null>(null);
  const filteredReviews = reviewStarFilter !== null
    ? reviews.filter((r) => r.rating === reviewStarFilter)
    : reviews;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-20">
      {/* Breadcrumb */}
      <Breadcrumb
        withSchema
        className="mb-6"
        items={[
          ...(product.category_name && product.category_slug
            ? [{ label: product.category_name, href: `/categories/${product.category_slug}` }]
            : [{ label: "Products", href: "/products" }]),
          { label: product.title },
        ]}
      />

      <div className="flex flex-col gap-10 lg:flex-row">
        {/* ── Gallery (extracted GallerySection component) ─────────────── */}
        <GallerySection
          mediaItems={mediaItems}
          productTitle={product.title}
          requiresMeasurement={product.requires_measurement}
          viewCount={(product as unknown as Record<string, unknown>).view_count as number | undefined}
          lastOrderedAt={(product as unknown as Record<string, unknown>).last_ordered_at as string | null | undefined}
          onWishlistToggle={() => toggleWishlist(product.slug)}
        />

        {/* ── Details panel ─────────────────────────────────────────────── */}
        <div className="w-full lg:max-w-[480px] space-y-5">
          {/* Vendor + category + verification */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Link
                href={`/vendors/${product.vendor_slug ?? ""}`}
                className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--primary))] hover:opacity-80"
              >
                {product.vendor_name}
              </Link>
              {/* Vendor verification badge — rendered when backend exposes it */}
              {Boolean((product as unknown as Record<string, unknown>).vendor_is_verified) && (
                <BadgeCheck
                  size={14}
                  className="text-[#01454A]"
                  aria-label="Verified vendor"
                />
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {product.category_name}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-bon_foyage text-3xl leading-tight text-foreground md:text-4xl">
            {product.title}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  fill={i < Math.floor(product.computed_avg_rating) ? "hsl(var(--accent))" : "none"}
                  stroke="hsl(var(--accent))"
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {product.computed_avg_rating.toFixed(1)} ({product.computed_review_count} reviews)
            </span>
          </div>

          {/* Trending + Eco signal badges */}
          {(() => {
            const p = product as unknown as Record<string, unknown>;
            const trendScore = p.ai_trend_score as number | undefined;
            const sustainScore = p.sustainability_score as number | undefined;
            const badges: React.ReactNode[] = [];
            if (trendScore && trendScore > 0.7) {
              badges.push(
                <span key="trending" className="inline-flex items-center gap-1 rounded-full bg-[#FDA600]/10 border border-[#FDA600]/30 px-2.5 py-0.5 text-[10px] font-bold text-[#B87800] uppercase tracking-wide">
                  <Flame size={9} className="text-[#FDA600]" />
                  Trending
                </span>
              );
            }
            if (sustainScore && sustainScore >= 75) {
              badges.push(
                <span key="eco" className="inline-flex items-center gap-1 rounded-full bg-[#059669]/10 border border-[#059669]/30 px-2.5 py-0.5 text-[10px] font-bold text-[#059669] uppercase tracking-wide">
                  <Leaf size={9} />
                  Eco Friendly
                </span>
              );
            }
            if (badges.length === 0) return null;
            return <div className="flex flex-wrap gap-2">{badges}</div>;
          })()}

          {/* Target Demographic */}
          {(product.gender_target || product.age_group) && (
            <div className="flex gap-2">
              {product.gender_target && (
                <Badge variant="secondary" className="capitalize text-xs font-semibold">
                  Target: {product.gender_target}
                </Badge>
              )}
              {product.age_group && (
                <Badge variant="secondary" className="capitalize text-xs font-semibold">
                  Age: {product.age_group}
                </Badge>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-foreground">
              {formatCurrency(displayPrice, product.currency ?? "NGN")}
            </span>
            {product.old_price && parseFloat(product.old_price) > displayPrice && (
              <span className="text-lg text-muted-foreground line-through">
                {formatCurrency(parseFloat(product.old_price), product.currency ?? "NGN")}
              </span>
            )}
          </div>

          {/* Pre-Order Alert */}
          {product.is_pre_order && (
            <div className="flex items-start gap-2 rounded-xl border border-dashed border-[#01454A]/30 bg-[#F7FAFA] px-4 py-3">
              <Package size={15} className="mt-0.5 shrink-0 text-[#01454A]" />
              <p className="text-xs text-foreground">
                <strong>Pre-Order Item:</strong> Expected dispatch date:{" "}
                <span className="font-semibold">{product.pre_order_date ? formatDate(product.pre_order_date) : "TBD"}</span>.
              </p>
            </div>
          )}

          {/* ── Measurement Gate — Full CTA Card ──────────────────────────── */}
          {product.requires_measurement && (
            <div className="rounded-2xl border-2 border-[#FDA600]/40 bg-gradient-to-r from-[#FDA600]/8 via-[#FDA600]/5 to-transparent p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#FDA600]/15">
                  <Ruler size={18} className="text-[#B87800]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#141414] mb-0.5">Measurements Required for Perfect Fit</p>
                  <p className="text-xs text-[#6B5E3A] leading-relaxed">
                    This item is tailored to your body. You need an AI measurement profile before ordering.
                  </p>
                  <Link
                    href="/get-measured"
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#FDA600] px-4 py-2 text-xs font-bold text-black hover:bg-[#F0A000] transition-colors duration-200"
                    data-testid="pdp-get-measured-cta"
                  >
                    <Ruler size={11} />
                    Get Measured — Free
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Color / Size variant selector (based on gallery color swatches) */}
          {galleryItems.length > 0 && galleryItems.some((v) => (v as { color_name?: string }).color_name) && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Select Colour
              </p>
              <div className="flex flex-wrap gap-2">
                {galleryItems
                  .filter((v: typeof galleryItems[0]): v is typeof galleryItems[0] & { color_name: string; color_hex: string } =>
                    !!(v as { color_name?: string }).color_name
                  )
                  .map((v: { color_name: string; color_hex?: string }, i: number) => {
                    const cn_ = v.color_name;
                    const hex = v.color_hex ?? "";

                    return (
                      <Button
                        key={i}
                        variant={selectedVariantId === String(i) ? "default" : "outline"}
                        onClick={() => {
                          setSelectedVariantId(String(i));
                          const idx = galleryItems.findIndex((item) => (item as { color_name?: string }).color_name === cn_);
                          if (idx !== -1) {
                            setActiveImg(idx);
                          }
                        }}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition h-auto min-h-0`}
                        title={cn_}
                      >
                        {hex && (
                          <span
                            className="inline-block h-4 w-4 rounded-full border border-black/10 flex-shrink-0"
                            style={{ background: hex }}
                          />
                        )}
                        {cn_}
                      </Button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Quantity stepper + Stock urgency */}
          <div className="flex items-center gap-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Qty
            </p>
            <div className="flex items-center rounded-xl border border-border bg-background px-2 py-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-muted p-0 min-w-0 min-h-0"
              >
                <Minus size={14} />
              </Button>
              <span className="w-10 text-center text-sm font-bold tabular-nums">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity((q) => Math.min((product as unknown as { stock_qty?: number }).stock_qty ?? 99, q + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-muted p-0 min-w-0 min-h-0"
              >
                <Plus size={14} />
              </Button>
            </div>
            {!inStock ? (
              <span className="text-xs font-semibold text-destructive">Out of stock</span>
            ) : (() => {
              const qty = (product as unknown as { stock_qty?: number }).stock_qty;
              if (qty !== undefined && qty > 0 && qty <= 5) {
                return (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-[10px] font-bold text-red-600">
                    🔥 Only {qty} left!
                  </span>
                );
              }
              return null;
            })()}
          </div>

          {/* CTA buttons — Add to Cart + Buy Now + Wishlist */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                ref={mainButtonRef}
                onClick={handleAddToCart}
                disabled={!inStock || cartLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[hsl(var(--accent))] py-4 text-sm font-bold text-[hsl(var(--accent-foreground))] shadow-md transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {cartLoading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                ) : (
                  <>
                    <ShoppingBag size={16} />
                    Add to Cart
                  </>
                )}
              </Button>

              <Button
                onClick={() => toggleWishlist(product.slug)}
                aria-label="Toggle wishlist"
                className="flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-card text-[hsl(var(--primary))] transition hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))/5] cursor-pointer"
              >
                <Heart size={20} />
              </Button>
            </div>

            {/* Buy Now — express checkout */}
            {inStock && (
              <Button
                onClick={() => {
                  handleAddToCart();
                  // Navigate to checkout after a short delay to allow cart state to update
                  setTimeout(() => { window.location.href = "/checkout"; }, 300);
                }}
                disabled={cartLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-[#01454A] bg-white py-3.5 text-sm font-bold text-[#01454A] hover:bg-[#01454A] hover:text-white transition-all duration-200 cursor-pointer"
                data-testid="pdp-buy-now-btn"
              >
                <Zap size={16} />
                Buy Now — Express Checkout
              </Button>
            )}
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {([
              { icon: Shield, label: "Secure Payment", sub: "256-bit SSL" },
              { icon: Truck, label: "Fast Delivery", sub: "2–5 business days" },
              { icon: RotateCcw, label: "Easy Returns", sub: "Within 14 days" },
              { icon: BadgeCheck, label: "100% Authentic", sub: "Vendor verified" },
            ] as const).map(({ icon: Icon, label, sub }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-xl border border-[#01454A]/10 bg-[#01454A]/3 px-3 py-2"
              >
                <Icon size={14} className="text-[#01454A] shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-foreground leading-tight truncate">{label}</p>
                  <p className="text-[9px] text-muted-foreground truncate">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Vendor mini-profile card ─────────────────────────────────────── */}
          {product.vendor_name && (
            <div className="flex items-center gap-3 rounded-2xl border border-[#01454A]/10 bg-gradient-to-r from-[#01454A]/4 to-transparent p-3">
              {/* Avatar */}
              <div className="relative h-11 w-11 shrink-0">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#01454A] to-[#0a6b72] flex items-center justify-center text-sm font-bold text-white shadow-sm">
                  {(product.vendor_name ?? "V").slice(0, 2).toUpperCase()}
                </div>
                {product.vendor_is_verified && (
                  <span
                    className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#01454A] border-2 border-white shadow"
                    title="Verified Vendor"
                  >
                    <BadgeCheck size={11} className="text-[#FDA600]" />
                  </span>
                )}
              </div>

              {/* Vendor info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{product.vendor_name}</p>
                {product.vendor_is_verified && (
                  <p className="text-[10px] text-[#01454A] font-semibold">✓ Verified Designer</p>
                )}
              </div>

              {/* Visit store CTA */}
              {product.vendor_slug && (
                <Link
                  href={`/vendors/${product.vendor_slug}`}
                  className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-[#01454A]/25 bg-white px-3 py-1.5 text-[10px] font-bold text-[#01454A] hover:bg-[#01454A] hover:text-white transition-all duration-150"
                  data-testid="pdp-visit-vendor-store"
                >
                  Visit Store →
                </Link>
              )}
            </div>
          )}

          {/* Accordion: Description / Specs / FAQs */}
          <div className="mt-2 rounded-2xl border border-border bg-card p-4">

            {product.description && (
              <AccordionItem title="Description">
                <p className="whitespace-pre-wrap">{product.description}</p>
              </AccordionItem>
            )}
            
            {product.fabric && (
              <AccordionItem title="Fabric & Care">
                <div className="space-y-4 pt-1">
                  <div className="flex flex-wrap gap-2">
                    {product.fabric.is_organic && (
                      <Badge variant="outline" className="border-emerald-500/30 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 text-[10px]">
                        Organic
                      </Badge>
                    )}
                    {product.fabric.is_vegan && (
                      <Badge variant="outline" className="border-green-500/30 bg-green-50/50 text-green-700 dark:bg-green-950/20 dark:text-green-400 text-[10px]">
                        Vegan
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-semibold text-foreground block mb-0.5">Fabric Type</span>
                      <span className="text-muted-foreground">{product.fabric.fabric_type}</span>
                    </div>
                    {product.fabric.country_of_origin && (
                      <div>
                        <span className="font-semibold text-foreground block mb-0.5">Origin</span>
                        <span className="text-muted-foreground">{product.fabric.country_of_origin}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border pt-3 space-y-2">
                    <div>
                      <span className="font-semibold text-foreground text-xs block">Care Instructions</span>
                      <span className="text-muted-foreground capitalize text-xs">
                        {product.fabric.care_instructions.replace(/_/g, " ")}
                      </span>
                    </div>
                    {/* care_notes removed from model — care_instructions is the canonical field */}

                  </div>
                </div>
              </AccordionItem>
            )}

            {product.shipping_profile && (
              <AccordionItem title="Shipping & Delivery">
                <div className="space-y-4 pt-1">
                  <div className="flex flex-wrap gap-2">
                    {product.shipping_profile.is_fragile && (
                      <Badge variant="outline" className="border-amber-500/30 bg-amber-50/50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 text-[10px]">
                        Fragile Product
                      </Badge>
                    )}
                    {product.shipping_profile.requires_signature && (
                      <Badge variant="outline" className="border-blue-500/30 bg-blue-50/50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 text-[10px]">
                        Signature Required
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-semibold text-foreground block mb-0.5">Package Weight</span>
                      <span className="text-muted-foreground">{product.shipping_profile.weight_kg} kg</span>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground block mb-0.5">Handling Time</span>
                      <span className="text-muted-foreground">{product.shipping_profile.processing_days} handling day{product.shipping_profile.processing_days > 1 ? "s" : ""}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground block mb-0.5">Volumetric Dimensions</span>
                      <span className="text-muted-foreground">
                        {parseFloat(product.shipping_profile.length_cm)} × {parseFloat(product.shipping_profile.width_cm)} × {parseFloat(product.shipping_profile.height_cm)} cm
                      </span>
                    </div>
                    {product.shipping_profile.free_shipping_threshold && (
                      <div>
                        <span className="font-semibold text-foreground block mb-0.5">Free Shipping Override</span>
                        <span className="text-muted-foreground">Orders above {formatCurrency(parseFloat(product.shipping_profile.free_shipping_threshold), product.currency ?? "NGN")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </AccordionItem>
            )}

            {product.sustainability_score !== undefined && product.sustainability_score !== null && (
              <AccordionItem title="Sustainability & Environmental Impact">
                <div className="space-y-4 pt-1">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-foreground flex items-center gap-1">🌱 Sustainability Score</span>
                      <span className="text-emerald-600">{product.sustainability_score}/100</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${product.sustainability_score}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    {product.carbon_footprint_kg !== undefined && product.carbon_footprint_kg !== null && (
                      <div>
                        <span className="font-semibold text-foreground block mb-0.5">Estimated Carbon Footprint</span>
                        <span className="text-muted-foreground">{product.carbon_footprint_kg} kg CO₂e</span>
                      </div>
                    )}
                    {product.ai_trend_score !== undefined && product.ai_trend_score !== null && (
                      <div>
                        <span className="font-semibold text-foreground block mb-0.5">Curation Trend Index</span>
                        <span className="text-muted-foreground">{product.ai_trend_score}% Trend Index</span>
                      </div>
                    )}
                  </div>
                </div>
              </AccordionItem>
            )}

            {product.measurement_guide && product.measurement_guide.length > 0 && (
              <AccordionItem title="Size Chart & Measurement Guide">
                <div className="space-y-3 pt-1">
                  <p className="text-xs text-muted-foreground">
                    Measurements are in centimeters. Compare these values with your body dimensions to find the perfect fit.
                  </p>
                  {(() => {
                    const rows = [...product.measurement_guide].sort((a, b) => a.sort_order - b.sort_order);
                    
                    // Determine which columns have data
                    const hasChest = rows.some(r => r.chest_cm && r.chest_cm !== "0" && r.chest_cm.trim() !== "");
                    const hasWaist = rows.some(r => r.waist_cm && r.waist_cm !== "0" && r.waist_cm.trim() !== "");
                    const hasHip = rows.some(r => r.hip_cm && r.hip_cm !== "0" && r.hip_cm.trim() !== "");
                    const hasShoulder = rows.some(r => r.shoulder_cm && r.shoulder_cm !== "0" && r.shoulder_cm.trim() !== "");
                    const hasSleeve = rows.some(r => r.sleeve_cm && r.sleeve_cm !== "0" && r.sleeve_cm.trim() !== "");
                    const hasLength = rows.some(r => r.length_cm && r.length_cm !== "0" && r.length_cm.trim() !== "");
                    const hasInseam = rows.some(r => r.inseam_cm && r.inseam_cm !== "0" && r.inseam_cm.trim() !== "");
                    const hasFoot = rows.some(r => r.foot_length_cm && r.foot_length_cm !== "0" && r.foot_length_cm.trim() !== "");

                    return (
                      <div className="overflow-x-auto rounded-xl border border-border bg-card">
                        <table className="w-full min-w-[500px] border-collapse text-left text-[11px]">
                          <thead>
                            <tr className="border-b border-border bg-muted/50 text-foreground font-semibold">
                              <th className="p-2.5">Size</th>
                              {hasChest && <th className="p-2.5">Chest</th>}
                              {hasWaist && <th className="p-2.5">Waist</th>}
                              {hasHip && <th className="p-2.5">Hips</th>}
                              {hasShoulder && <th className="p-2.5">Shoulder</th>}
                              {hasSleeve && <th className="p-2.5">Sleeve</th>}
                              {hasLength && <th className="p-2.5">Length</th>}
                              {hasInseam && <th className="p-2.5">Inseam</th>}
                              {hasFoot && <th className="p-2.5">Foot</th>}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border text-muted-foreground">
                            {rows.map((r, i) => (
                              <tr key={i} className="hover:bg-muted/30 transition-colors">
                                <td className="p-2.5 font-semibold text-foreground">{r.size_label}</td>
                                {hasChest && <td className="p-2.5">{r.chest_cm || "—"}</td>}
                                {hasWaist && <td className="p-2.5">{r.waist_cm || "—"}</td>}
                                {hasHip && <td className="p-2.5">{r.hip_cm || "—"}</td>}
                                {hasShoulder && <td className="p-2.5">{r.shoulder_cm || "—"}</td>}
                                {hasSleeve && <td className="p-2.5">{r.sleeve_cm || "—"}</td>}
                                {hasLength && <td className="p-2.5">{r.length_cm || "—"}</td>}
                                {hasInseam && <td className="p-2.5">{r.inseam_cm || "—"}</td>}
                                {hasFoot && <td className="p-2.5">{r.foot_length_cm || "—"}</td>}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              </AccordionItem>
            )}

            {/* Specifications (kept as optional, guarded) */}
            {(product as unknown as { specifications?: unknown[] }).specifications &&
              ((product as unknown as { specifications: { title: string; content: string }[] }).specifications ?? []).length > 0 && (
              <AccordionItem title="Specifications">
                <dl className="space-y-2">
                  {((product as unknown as { specifications: { title: string; content: string }[] }).specifications ?? []).map((s: { title: string; content: string }, i: number) => (
                    <div key={i} className="flex justify-between">
                      <dt className="font-medium text-foreground">{s.title}</dt>
                      <dd>{s.content}</dd>
                    </div>
                  ))}
                </dl>
              </AccordionItem>
            )}

            {product.faqs?.length > 0 && (
              <AccordionItem title="FAQs">
                <div className="space-y-4">
                  {product.faqs.map((f, i) => (
                    <div key={i}>
                      <p className="font-semibold text-foreground">{f.question}</p>
                      <p className="mt-1">{f.answer}</p>
                    </div>
                  ))}
                </div>
              </AccordionItem>
            )}
          </div>
        </div>
      </div>

      {/* ── R19: Blog Style Guide commerce CTA ──────────────────────────────── */}
      <div className="mt-10 rounded-2xl border border-[#01454A]/20 bg-gradient-to-r from-[#01454A]/5 via-[#FDA600]/3 to-[#01454A]/5 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-raleway text-xs font-bold uppercase tracking-widest text-[#01454A] mb-1">
            Style Intelligence
          </p>
          <h3 className="font-bon_foyage text-lg text-foreground leading-tight">
            How to Style This Piece
          </h3>
          <p className="font-raleway text-xs text-muted-foreground mt-1 leading-relaxed">
            Read our curated guides on how to wear, layer, and accessorise this style — from casual
            daywear to formal occasions.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
          <Link
            href="/blog"
            data-testid="pdp-blog-style-guide-link"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#01454A]/30 bg-[#01454A]/8 px-4 py-2.5 font-raleway text-xs font-bold text-[#01454A] hover:bg-[#01454A] hover:text-white transition-all duration-150"
          >
            Read Style Guide →
          </Link>
          <Link
            href="/get-measured"
            data-testid="pdp-blog-measure-link"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#FDA600] px-4 py-2.5 font-raleway text-xs font-bold text-black hover:bg-[#F0A000] transition-all duration-150"
          >
            Get Measured Free
          </Link>
        </div>
      </div>

      {/* ── Reviews section ─────────────────────────────────────────────── */}
      {reviews.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-bon_foyage text-3xl text-foreground">Customer Reviews</h2>

          {/* Star rating breakdown */}
          <div className="mb-8 rounded-2xl border border-border bg-card p-5 flex flex-col sm:flex-row gap-6">
            {/* Overall score */}
            <div className="flex flex-col items-center justify-center sm:border-r sm:border-border sm:pr-6 sm:w-36 shrink-0">
              <span className="text-5xl font-bold text-foreground">
                {product.computed_avg_rating.toFixed(1)}
              </span>
              <div className="flex items-center gap-0.5 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < Math.round(product.computed_avg_rating) ? "hsl(var(--accent))" : "none"}
                    stroke="hsl(var(--accent))"
                    strokeWidth={1.5}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {product.computed_review_count} review{product.computed_review_count !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Breakdown bars */}
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter((r) => r.rating === star).length;
                const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-muted-foreground w-3 text-right">{star}</span>
                    <Star size={10} fill="hsl(var(--accent))" stroke="hsl(var(--accent))" className="shrink-0" />
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#FDA600] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Star filter chips ─────────────────────────────────────── */}
          {reviews.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pb-2">
              <span className="text-xs font-medium text-muted-foreground">Filter:</span>
              <button
                type="button"
                onClick={() => setReviewStarFilter(null)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  reviewStarFilter === null
                    ? "bg-[#01454A] text-white"
                    : "bg-muted text-muted-foreground hover:bg-[#01454A]/10"
                }`}
              >
                All ({reviews.length})
              </button>
              {[5, 4, 3, 2, 1].map((star) => {
                const cnt = reviews.filter((r) => r.rating === star).length;
                if (cnt === 0) return null;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewStarFilter(reviewStarFilter === star ? null : star)}
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                      reviewStarFilter === star
                        ? "bg-[#FDA600] text-black"
                        : "bg-muted text-muted-foreground hover:bg-[#FDA600]/20"
                    }`}
                  >
                    {star}★ ({cnt})
                  </button>
                );
              })}
            </div>
          )}

          {/* Reviews grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {filteredReviews.length === 0 && reviewStarFilter !== null ? (
              <div className="col-span-2 py-10 text-center text-sm text-muted-foreground">
                No {reviewStarFilter}★ reviews yet.
                <button
                  type="button"
                  onClick={() => setReviewStarFilter(null)}
                  className="ml-2 underline text-[#01454A] hover:opacity-80"
                >
                  Show all reviews
                </button>
              </div>
            ) : (
              filteredReviews.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-[var(--card-shadow)]"
              >
                <div className="mb-3 flex items-start gap-3">
                  {r.reviewer_avatar_url ? (
                    <FashionistarImage
                      src={r.reviewer_avatar_url}
                      alt={r.reviewer_display}
                      width={40}
                      height={40}
                      className="h-10 w-10 overflow-hidden rounded-full"
                      imgClassName="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-sm font-bold text-primary-foreground">
                      {r.reviewer_display[0]}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-foreground">{r.reviewer_display}</p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={11}
                          fill={i < r.rating ? "hsl(var(--accent))" : "none"}
                          stroke="hsl(var(--accent))"
                        />
                      ))}
                    </div>
                  </div>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {formatDate(r.created_at)}
                  </span>
                </div>
                <p className="text-sm leading-6 text-foreground">{r.review}</p>
              </div>
            ))
            )}
          </div>
        </section>
      )}

      {/* ── Related products carousel ─────────────────────────────────────── */}
      <RelatedProductsCarousel
        currentSlug={slug}
        categorySlug={product.category_slug}
        categoryName={product.category_name}
      />

      <ProductStickyAddToCartBar
        title={product.title}
        price={displayPrice}
        currency={product.currency ?? "NGN"}
        inStock={inStock}
        cartLoading={cartLoading}
        mainButtonRef={mainButtonRef}
        onAddToCart={handleAddToCart}
        onToggleWishlist={() => toggleWishlist(product.slug)}
      />
    </div>
  );
}
