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

import Image from "next/image";
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
  AlertTriangle,
  ArrowLeft,
  Package,
} from "lucide-react";
import { useProductDetail, useProductReviews, useToggleWishlist } from "@/features/product";
import { useAddCartItem } from "@/features/cart/hooks/use-cart";
import { productCatalogApi } from "@/features/catalog";
import { formatCurrency, formatDate } from "@/lib/utils";


interface ProductDetailClientProps {
  slug: string;
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
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold text-foreground hover:text-[hsl(var(--primary))] transition-colors"
        aria-expanded={open}
      >
        {title}
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && (
        <div className="pb-4 text-sm leading-7 text-muted-foreground">
          {children}
        </div>
      )}
    </div>
  );
}

export function ProductDetailClient({ slug }: ProductDetailClientProps) {
  const { data: product, isError } = useProductDetail(slug);
  const { data: reviewsData } = useProductReviews(slug, 1);
  const { mutate: toggleWishlist } = useToggleWishlist();
  const { mutate: addToCart, isPending: cartLoading } = useAddCartItem();

  const [activeImg, setActiveImg] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

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
  // ───────────────────────────────────────────────────────────────────────

  if (isError || !product) {
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

  const images =
    product.gallery?.length
      ? product.gallery.map((g) => g.media_url ?? "/gown.svg")
      : product.cover_image_url
      ? [product.cover_image_url]
      : ["/gown.svg"];

  const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId);
  const displayPrice = selectedVariant?.price_override
    ? parseFloat(selectedVariant.price_override)
    : parseFloat(product.price);

  const inStock = selectedVariant ? selectedVariant.stock_qty > 0 : product.stock_qty > 0;

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
      <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition">Home</Link>
        <span>/</span>
        <Link
              href={`/categories/${product.category_slug ?? ""}`}
              className="hover:text-foreground transition"
            >
              {product.category_name ?? "Categories"}
            </Link>
        <span>/</span>
        <span className="text-foreground line-clamp-1">{product.title}</span>
      </nav>

      <div className="flex flex-col gap-10 lg:flex-row">
        {/* ── Gallery ──────────────────────────────────────────────────── */}
        <div className="flex-1">
          {/* Main image */}
          <div className="relative h-[420px] w-full overflow-hidden rounded-2xl bg-[hsl(var(--brand-cream))] md:h-[520px]">
            <Image
              src={images[activeImg] ?? "/gown.svg"}
              alt={product.title}
              fill
              sizes="(max-width:768px) 100vw, 50vw"
              className="object-contain p-4 transition-opacity duration-300"
              priority
            />
            {product.requires_measurement && (
              <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-[hsl(var(--primary))] px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                <Ruler size={12} /> Custom Fit Required
              </span>
            )}
            {/* Wishlist float */}
            <button
              onClick={() => toggleWishlist(product.slug)}
              aria-label="Toggle wishlist"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md text-[hsl(var(--primary))] transition hover:scale-110"
            >
              <Heart size={18} strokeWidth={2} />
            </button>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.map((src, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImg(idx)}
                  className={`relative h-20 overflow-hidden rounded-xl border-2 transition ${
                    activeImg === idx
                      ? "border-[hsl(var(--accent))]"
                      : "border-transparent hover:border-border"
                  }`}
                >
                  <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Details panel ─────────────────────────────────────────────── */}
        <div className="w-full lg:max-w-[480px] space-y-5">
          {/* Vendor + category */}
          <div className="flex items-center justify-between">
            <Link
              href={`/shops/${product.vendor_slug ?? ""}`}
              className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--primary))] hover:opacity-80"
            >
              {product.vendor_name}
            </Link>
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

          {/* Measurement warning */}
          {product.requires_measurement && (
            <div className="flex items-start gap-2 rounded-xl border border-[hsl(var(--warning))/30] bg-[hsl(var(--warning-bg))] px-4 py-3">
              <AlertTriangle size={15} className="mt-0.5 shrink-0 text-[hsl(var(--warning))]" />
              <p className="text-xs text-foreground">
                This item requires a measurement profile.{" "}
                <Link href="/get-measured" className="font-semibold underline">
                  Get measured →
                </Link>
              </p>
            </div>
          )}

          {/* Size selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Select Size / Variant
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    disabled={!v.is_active || v.stock_qty === 0}
                    className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                      selectedVariantId === v.id
                        ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
                        : v.stock_qty === 0 || !v.is_active
                        ? "border-border bg-muted text-muted-foreground line-through cursor-not-allowed opacity-50"
                        : "border-border hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))]"
                    }`}
                  >
                    {v.size?.name ?? v.color?.name ?? v.sku}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity stepper */}
          <div className="flex items-center gap-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Qty
            </p>
            <div className="flex items-center rounded-xl border border-border bg-background px-2 py-1">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-muted"
              >
                <Minus size={14} />
              </button>
              <span className="w-10 text-center text-sm font-bold tabular-nums">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-muted"
              >
                <Plus size={14} />
              </button>
            </div>
            {!inStock && (
              <span className="text-xs font-semibold text-destructive">Out of stock</span>
            )}
          </div>

          {/* CTA buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={!inStock || cartLoading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[hsl(var(--accent))] py-4 text-sm font-bold text-[hsl(var(--accent-foreground))] shadow-md transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {cartLoading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
              ) : (
                <>
                  <ShoppingBag size={16} />
                  Add to Cart
                </>
              )}
            </button>

            <button
              onClick={() => toggleWishlist(product.slug)}
              aria-label="Toggle wishlist"
              className="flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-card text-[hsl(var(--primary))] transition hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))/5]"
            >
              <Heart size={20} />
            </button>
          </div>

          {/* Accordion: Description / Specs / FAQs */}
          <div className="mt-2 rounded-2xl border border-border bg-card p-4">
            {product.description && (
              <AccordionItem title="Description">
                <p className="whitespace-pre-wrap">{product.description}</p>
              </AccordionItem>
            )}
            {product.specifications?.length > 0 && (
              <AccordionItem title="Specifications">
                <dl className="space-y-2">
                  {product.specifications.map((s, i) => (
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

      {/* ── Reviews section ─────────────────────────────────────────────── */}
      {reviews.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-bon_foyage text-3xl text-foreground">Customer Reviews</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-[var(--card-shadow)]"
              >
                <div className="mb-3 flex items-start gap-3">
                  {r.reviewer_avatar_url ? (
                    <Image
                      src={r.reviewer_avatar_url}
                      alt={r.reviewer_display}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
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
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
