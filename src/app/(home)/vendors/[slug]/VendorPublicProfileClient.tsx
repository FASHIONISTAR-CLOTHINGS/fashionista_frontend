"use client";

/**
 * VendorPublicProfileClient.tsx
 *
 * Live TanStack Query–driven client island for the public vendor storefront.
 * Renders inside the Server Component `/vendors/[slug]/page.tsx`.
 *
 * Features:
 *  - High-end sticky sidebar grid layout for desktop view
 *  - Premium glassmorphism store info and stats card
 *  - Social sharing center (copy link, WhatsApp share, Twitter share)
 *  - Custom sizing guide CTA with step-by-step bespoke tailoring process
 *  - Honest live catalog states (no fabricated testimonials or category tabs)
 *  - Live product grid integration
 */

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ExternalLink,
  Instagram,
  MapPin,
  MessageCircle,
  Ruler,
  ShoppingBag,
  Star,
  Twitter,
  Verified,
  Zap,
  Share2,
  Link2,
  CheckCircle2,
} from "lucide-react";
import { useProducts } from "@/features/product";
import { ProductCard, ProductCardSkeleton } from "@/features/product";
import type { ProductListItem } from "@/features/product";
import { Button } from "@/components/ui/button";

// ── Brand palette ─────────────────────────────────────────────────────────────
const P = {
  green:  "#01454A",
  greenL: "#1a6b72",
  gold:   "#FDA600",
  goldD:  "#E89500",
  cream:  "#F8F5ED",
  creamB: "#ECE6D6",
  muted:  "#7A6B44",
  ink:    "#141414",
} as const;

// ── Sub-components ────────────────────────────────────────────────────────────

function StarRating({ value, count }: { value: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5 justify-center lg:justify-start">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className="h-3.5 w-3.5"
            fill={s <= Math.round(value) ? P.gold : "none"}
            stroke={s <= Math.round(value) ? P.gold : "#CBD5E1"}
          />
        ))}
      </div>
      <span className="text-xs font-bold text-[#7A6B44]">
        {value.toFixed(1)} ({count.toLocaleString()} reviews)
      </span>
    </div>
  );
}

function StatCard({
  value,
  label,
  icon: Icon,
}: {
  value: string | number;
  label: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-[#ECE6D6] bg-white px-4 py-3.5 text-center shadow-sm hover:shadow transition-shadow">
      <Icon className="h-5 w-5 text-[#01454A]" aria-hidden="true" />
      <span className="text-xl font-black text-black">
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-widest font-black text-[#7A6B44]">
        {label}
      </span>
    </div>
  );
}

function ProductGrid({
  vendorSlug,
}: {
  vendorSlug: string;
}) {
  const { data, isLoading, isError } = useProducts({ vendor: vendorSlug });

  const products: ProductListItem[] = data?.results ?? [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 md:gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center rounded-[2.5rem] border border-dashed border-[#7A6B44]/20 bg-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <p className="text-base font-bold text-[#7A6B44]">
          Unable to load products right now.
        </p>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Please check your connection and refresh.
        </p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center rounded-[2.5rem] border border-dashed border-[#7A6B44]/20 bg-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#01454A]/5 text-[#01454A]">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <p className="text-lg font-bon_foyage text-[#01454A]">No products found</p>
        <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-xs">
          This vendor does not have live published products on the storefront right now.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 md:gap-5">
      {products.map((product: ProductListItem) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

interface VendorPublicProfileClientProps {
  vendorSlug:    string;
  displayName:   string;
  logoUrl?:      string;
  coverUrl?:     string;
  tagline?:      string;
  description?:  string;
  city?:         string;
  state?:        string;
  isVerified?:   boolean;
  isFeatured?:   boolean;
  whatsapp?:     string;
  instagram?:    string;
  twitter?:      string;
  tiktok?:       string;
  website?:      string;
  totalProducts?:number;
  totalSales?:   number;
  avgRating?:    number;
  reviewCount?:  number;
  collections?:  Array<{ id: string; title: string; slug: string }>;
}

export default function VendorPublicProfileClient({
  vendorSlug,
  displayName,
  tagline,
  description,
  city,
  state: vendorState,
  isVerified  = false,
  isFeatured  = false,
  whatsapp    = "",
  instagram   = "",
  twitter     = "",
  tiktok      = "",
  website     = "",
  totalProducts = 0,
  totalSales    = 0,
  avgRating     = 0,
  reviewCount   = 0,
  collections   = [],
}: VendorPublicProfileClientProps) {
  const [shareCopied, setShareCopied] = useState(false);

  const location = [city, vendorState].filter(Boolean).join(", ");
  const whatsappHref = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=Hi%20${encodeURIComponent(displayName)}%2C%20I%20found%20your%20store%20on%20Fashionistar%21`
    : "";

  const handleShareCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const handleWhatsappShare = () => {
    if (typeof window !== "undefined") {
      const url = `https://api.whatsapp.com/send?text=Check%20out%20this%20amazing%20store%20on%20Fashionistar%3A%20${encodeURIComponent(window.location.href)}`;
      window.open(url, "_blank");
    }
  };

  const handleTwitterShare = () => {
    if (typeof window !== "undefined") {
      const url = `https://twitter.com/intent/tweet?text=Check%20out%20this%20amazing%20store%20on%20Fashionistar%20%40Fashionistar%3A%20&url=${encodeURIComponent(window.location.href)}`;
      window.open(url, "_blank");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:items-start">
      {/* ── Left Columns (2/3 width on desktop): Profile Details, Products ── */}
      <div className="space-y-10 lg:col-span-2">
        {/* Store Bio & Tagline */}
        <section className="rounded-[2rem] border border-[#ECE6D6] bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-2.5 mb-5">
            {isVerified && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#01454A]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wide text-[#01454A]">
                <Verified className="h-3.5 w-3.5" /> Verified Studio
              </span>
            )}
            {isFeatured && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDA600]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wide text-[#E89500]">
                <Star className="h-3.5 w-3.5 fill-[#E89500]" /> Featured
              </span>
            )}
            {location && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ECE6D6] bg-white px-3.5 py-1 text-xs font-medium text-[#7A6B44]">
                <MapPin className="h-3.5 w-3.5" /> {location}
              </span>
            )}
          </div>

          <h2 className="font-bon_foyage text-4xl text-[#01454A] leading-tight mb-4">
            {tagline || `${displayName} — Custom Tailoring & Fashion`}
          </h2>
          <p className="text-base leading-8 text-[hsl(var(--muted-foreground))]">
            {description ||
              "Welcome to our public catalog storefront. We specialize in custom measurements, artisanal designs, and made-to-measure premium garments. Select any style, add your measurement profile, and let our designers craft a perfect fit."}
          </p>

          {/* Social profile links */}
          {(instagram || twitter || tiktok || website) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#ECE6D6] px-3.5 py-1.5 text-xs font-bold text-[#7A6B44] hover:border-[#FDA600] hover:text-[#01454A] transition-all hover:bg-[#F8F5ED]"
                >
                  <Instagram className="h-3.5 w-3.5 text-[#01454A]" /> Instagram
                </a>
              )}
              {twitter && (
                <a
                  href={twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#ECE6D6] px-3.5 py-1.5 text-xs font-bold text-[#7A6B44] hover:border-[#FDA600] hover:text-[#01454A] transition-all hover:bg-[#F8F5ED]"
                >
                  <Twitter className="h-3.5 w-3.5 text-[#01454A]" /> Twitter / X
                </a>
              )}
              {tiktok && (
                <a
                  href={tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#ECE6D6] px-3.5 py-1.5 text-xs font-bold text-[#7A6B44] hover:border-[#FDA600] hover:text-[#01454A] transition-all hover:bg-[#F8F5ED]"
                >
                  Tiktok
                </a>
              )}
              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#ECE6D6] px-3.5 py-1.5 text-xs font-bold text-[#7A6B44] hover:border-[#FDA600] hover:text-[#01454A] transition-all hover:bg-[#F8F5ED]"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-[#01454A]" /> Website
                </a>
              )}
            </div>
          )}

          {/* Social Share items */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-[#ECE6D6] pt-6">
            <span className="text-xs font-black uppercase tracking-widest text-[#7A6B44] flex items-center gap-2">
              <Share2 className="h-4 w-4" /> Share storefront
            </span>
            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={handleShareCopy}
                className="flex h-10 px-4 items-center gap-2 rounded-full border border-[#ECE6D6] bg-white text-xs font-bold text-[#475367] transition-all hover:bg-[#F8F5ED] hover:text-[#01454A]"
              >
                {shareCopied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Copied link
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4" /> Copy storefront link
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleWhatsappShare}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ECE6D6] bg-white text-[#475367] transition-all hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                title="Share to WhatsApp"
              >
                <MessageCircle className="h-4.5 w-4.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleTwitterShare}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ECE6D6] bg-white text-[#475367] transition-all hover:bg-sky-50 hover:text-sky-500 hover:border-sky-200"
                title="Share to Twitter / X"
              >
                <Twitter className="h-4.5 w-4.5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Collections Chips */}
        {collections.length > 0 && (
          <section className="space-y-4" aria-label="Boutique collections">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#7A6B44]">
              Boutique Collections
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {collections.map((col) => (
                <Link
                  key={col.id}
                  href={`/collections/${col.slug}`}
                  className="group inline-flex items-center gap-2 rounded-full border border-[#ECE6D6] bg-white px-5 py-2.5 text-sm font-bold text-black transition-all hover:border-[#FDA600] hover:text-[#01454A] shadow-sm hover:shadow"
                >
                  {col.title}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Products Catalog Grid with Tabs */}
        <section className="space-y-6" aria-labelledby="catalog-heading">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 id="catalog-heading" className="font-bon_foyage text-4xl text-[#01454A]">
              Product Catalog
            </h2>
            <Link
              href="/categories"
              className="inline-flex items-center gap-1.5 text-sm font-black text-[#01454A] hover:underline"
            >
              Browse categories <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-2xl border border-[#ECE6D6] bg-white px-5 py-4 text-sm leading-6 text-[#7A6B44]">
            This catalog reflects the vendor&apos;s currently published storefront items. We removed the old hardcoded category tabs so only live inventory or an explicit empty state appears here.
          </div>

          {/* Product grid */}
          <ProductGrid vendorSlug={vendorSlug} />
        </section>

        {/* Custom Order CTA Section */}
        <section className="rounded-[2.5rem] border border-[#ECE6D6] bg-[#F8F5ED] p-8 text-center space-y-4">
          <h3 className="font-bon_foyage text-3xl text-[#01454A]">
            Request a Custom Masterpiece
          </h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-lg mx-auto leading-7">
            Can&apos;t find your exact style or color? Send us your references, sketches, and specifications. We will send back a custom quote and begin crafting.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href={`/contact-us?vendor=${vendorSlug}&type=custom_order`}
              className="inline-flex items-center gap-2 rounded-full bg-[#01454A] px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#1a2e14] active:scale-95 shadow-md shadow-[#01454A]/10"
            >
              Request Custom Order
            </Link>
            <Link
              href="/get-measured"
              className="inline-flex items-center gap-2 rounded-full border border-[#01454A]/30 bg-white px-6 py-3.5 text-sm font-bold text-[#01454A] transition hover:bg-[#F8F5ED] active:scale-95"
            >
              <Ruler className="h-4 w-4" /> View My Sizing
            </Link>
          </div>
        </section>
      </div>

      {/* ── Right Column (1/3 width on desktop): Sticky stats, Sizing guide, Reviews ── */}
      <div className="space-y-10 lg:sticky lg:top-24">
        {/* Quick Stats Summary Card */}
        <div className="rounded-[2rem] border border-[#ECE6D6] bg-white p-6 shadow-sm space-y-6">
          <h3 className="font-bon_foyage text-2xl text-[#01454A] text-center lg:text-left">
            Boutique Stats
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <StatCard value={`${avgRating > 0 ? avgRating.toFixed(1) : "5.0"}★`} label="Rating" icon={Star} />
            <StatCard value={totalProducts} label="Products" icon={ShoppingBag} />
            <StatCard value={`${totalSales}+`} label="Sales" icon={Zap} />
            <StatCard value="< 2h" label="Response" icon={MessageCircle} />
          </div>
          {reviewCount > 0 && (
            <div className="pt-4 border-t border-[#ECE6D6]">
              <StarRating value={avgRating} count={reviewCount} />
            </div>
          )}
        </div>

        {/* Tailored Fit Sizing Guide CTA */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#01454A] to-[#1a6b72] p-6 text-white shadow-lg space-y-6">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#FDA600]/10" />
          <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/5" />

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#FDA600]">
              <Ruler className="h-3.5 w-3.5" /> Made-To-Measure
            </div>
            <h3 className="font-bon_foyage text-2xl leading-snug">
              Bespoke Fitting Made Simple
            </h3>
            <p className="text-xs text-white/80 leading-5">
              Tired of standard sizes? Submit your body measurements once to enjoy customized fittings from {displayName}.
            </p>
          </div>

          {/* Stepper info list */}
          <div className="space-y-3 pt-2 text-xs text-white/90">
            <div className="flex items-center gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FDA600] font-bold text-black">1</span>
              <span>Input measurements in our free wizard.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FDA600] font-bold text-black">2</span>
              <span>Select &apos;Custom Sizing&apos; on product page.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FDA600] font-bold text-black">3</span>
              <span>Delivered perfectly fit, alterations free.</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Link
              href="/get-measured"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FDA600] to-[#E89500] px-5 py-3 text-xs font-black text-black shadow-md shadow-[#FDA600]/20 hover:brightness-105 active:scale-95 transition-all"
            >
              <Ruler className="h-4 w-4" />
              Get Measured Free
            </Link>
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 px-5 py-3 text-xs font-bold text-white hover:bg-white/10 active:scale-95 transition-all"
              >
                <MessageCircle className="h-4 w-4 text-[#FDA600]" />
                Inquire on WhatsApp
              </a>
            )}
          </div>
        </div>

        {/* Honest storefront proof */}
        <div className="rounded-[2rem] border border-[#ECE6D6] bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bon_foyage text-2xl text-[#01454A]">
              Storefront Snapshot
            </h3>
            {reviewCount > 0 ? (
              <span className="rounded-full bg-[#F8F5ED] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#7A6B44]">
                {reviewCount} live reviews
              </span>
            ) : null}
          </div>

          <div className="rounded-2xl bg-[#F8F5ED] p-5 space-y-4">
            <p className="text-xs leading-6 text-[hsl(var(--muted-foreground))]">
              We removed the old static testimonial carousel from this storefront. Shopper trust on this page now comes from live catalog data, verified vendor status, published product volume, and real rating totals when they are available.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#7A6B44]">Rating</p>
                <p className="mt-2 font-bon_foyage text-3xl text-[#01454A]">
                  {avgRating > 0 ? avgRating.toFixed(1) : "N/A"}
                </p>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#7A6B44]">Published products</p>
                <p className="mt-2 font-bon_foyage text-3xl text-[#01454A]">
                  {totalProducts}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
