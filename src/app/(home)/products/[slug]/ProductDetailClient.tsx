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
  ArrowLeft,
  Package,
  BadgeCheck,
  Flame,
  Leaf,
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductStickyAddToCartBar } from "@/features/product/components/pdp/ProductStickyAddToCartBar";
import { RelatedProductsCarousel } from "@/features/product/components/pdp/RelatedProductsCarousel";
import { GallerySection } from "@/features/product/components/pdp/GallerySection";
import { VariantSelector } from "@/features/product/components/pdp/VariantSelector";
import { ReviewSection } from "@/features/product/components/pdp/ReviewSection";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ProductAccordion } from "@/features/product/components/pdp/ProductAccordion";
import { SocialProofBadge } from "@/features/product/components/pdp/SocialProofBadge";
import { StockScarcityIndicator } from "@/features/product/components/pdp/StockScarcityIndicator";
import { TrustSignalsBlock } from "@/features/product/components/pdp/TrustSignalsBlock";
import { FlashSaleCountdown } from "@/features/product/components/pdp/FlashSaleCountdown";

interface ProductDetailClientProps {
  slug: string;
  initialProduct?: ProductDetail | null;
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

  const [activeImg, setActiveImg] = useState(0);
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
          activeIndex={activeImg}
          onActiveIndexChange={setActiveImg}
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

          {/* ── Social Proof: Live viewers + sold today (Work 1) ─────────── */}
          <SocialProofBadge
            slug={product.slug}
            fallbackViewCount={(product as unknown as Record<string, unknown>).view_count as number | undefined}
            fallbackOrdersCount={(product as unknown as Record<string, unknown>).orders_count as number | undefined}
            categorySlug={product.category_slug}
          />

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

          {/* Color / Size variant selector (extracted VariantSelector component) */}
          <VariantSelector
            galleryItems={galleryItems}
            selectedVariantId={selectedVariantId}
            onSelectVariant={(id, colorName) => {
              setSelectedVariantId(id);
              const idx = galleryItems.findIndex(
                (item) => (item as { color_name?: string }).color_name === colorName
              );
              if (idx !== -1) {
                setActiveImg(idx);
              }
            }}
          />

          {/* ── Stock Scarcity Indicator (Work 1) ─────────────────────────── */}
          <StockScarcityIndicator
            stockQty={(product as unknown as { stock_qty?: number }).stock_qty}
            inStock={inStock}
          />

          {/* Quantity stepper */}
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
            {!inStock && (
              <span className="text-xs font-semibold text-destructive">Out of stock</span>
            )}
          </div>

          {/* ── Flash Sale Countdown (Work 1) ─────────────────────────────── */}
          <FlashSaleCountdown
            targetDate={(product as unknown as Record<string, unknown>).discount_countdown as string | undefined}
            discountPercentage={(product as unknown as Record<string, unknown>).discount_percentage as number | undefined}
          />

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

          {/* ── Trust Signals (Work 1: data-driven, replaces static badges) ── */}
          <TrustSignalsBlock product={product} />

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

          {/* Accordion: Description / Specs / FAQs (extracted ProductAccordion component) */}
          <ProductAccordion product={product} />
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

      {/* ── Reviews section (extracted ReviewSection component) ─────────── */}
      <ReviewSection
        reviews={reviews}
        avgRating={product.computed_avg_rating}
        reviewCount={product.computed_review_count}
      />

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
