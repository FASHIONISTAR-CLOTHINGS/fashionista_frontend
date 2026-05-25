"use client";

/**
 * VendorPublicProfileClient.tsx
 *
 * Live TanStack Query–driven client island for the public vendor storefront.
 * Renders inside the Server Component `/vendors/[slug]/page.tsx`.
 *
 * Features:
 *  - Live product grid with category/collection tab filtering
 *  - Store stats (rating, orders, response time, products)
 *  - Custom sizing CTA with measurement interstitial hook
 *  - Social links (Instagram, TikTok, WhatsApp, Twitter/X)
 *  - Collection chips from vendor profile
 *  - Star rating display per product
 *  - Graceful loading / error / empty states
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
} from "lucide-react";
import { useProducts } from "@/features/product";
import { ProductCard, ProductCardSkeleton } from "@/features/product";
import type { ProductListItem } from "@/features/product";

// ── Brand palette ─────────────────────────────────────────────────────────────
const P = {
  green:  "#01454A",
  greenL: "#1a6b72",
  gold:   "#FDA600",
  goldD:  "#E89500",
  cream:  "#F8F5ED",
  creamB: "#ECE6D6",
  muted:  "#475367",
  ink:    "#141414",
} as const;

// ── Sub-components ────────────────────────────────────────────────────────────

function StarRating({ value, count }: { value: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
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
      <span className="text-xs font-semibold" style={{ color: P.muted }}>
        {value.toFixed(1)} ({count.toLocaleString()} reviews)
      </span>
    </div>
  );
}

function StatPill({
  value,
  label,
  icon: Icon,
}: {
  value: string | number;
  label: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex flex-col items-center gap-1 px-5 py-3 rounded-2xl border border-[#ECE6D6] bg-white text-center min-w-[90px]">
      <Icon className="h-4 w-4" style={{ color: P.green }} aria-hidden="true" />
      <span className="text-lg font-bold leading-none" style={{ color: P.ink }}>
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: P.muted }}>
        {label}
      </span>
    </div>
  );
}

// ── Social link button ────────────────────────────────────────────────────────
function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ECE6D6] bg-white text-[#475367] transition-all hover:border-[#FDA600] hover:text-[#FDA600] hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#FDA600]/60 outline-none"
    >
      {children}
    </a>
  );
}

// ── Product grid section ──────────────────────────────────────────────────────
function ProductGrid({
  vendorSlug,
  activeTab,
}: {
  vendorSlug: string;
  activeTab:  string;
}) {
  const { data, isLoading, isError } = useProducts({
    vendor: vendorSlug,
    ...(activeTab !== "all" ? { category: activeTab } : {}),
  });

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
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: `${P.gold}20` }}
        >
          <ShoppingBag className="h-8 w-8" style={{ color: P.gold }} />
        </div>
        <p className="text-base font-semibold" style={{ color: P.muted }}>
          Unable to load products right now. Please try again.
        </p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: `${P.green}15` }}
        >
          <ShoppingBag className="h-8 w-8" style={{ color: P.green }} />
        </div>
        <p className="text-base font-semibold" style={{ color: P.muted }}>
          No products in this category yet.
        </p>
        <p className="text-sm" style={{ color: P.muted }}>
          Check back soon or explore all products.
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

// ── Category tabs ─────────────────────────────────────────────────────────────
const CATEGORY_TABS = [
  { key: "all",           label: "All Products" },
  { key: "dresses",       label: "Dresses"      },
  { key: "suits",         label: "Suits"        },
  { key: "traditional",   label: "Traditional"  },
  { key: "accessories",   label: "Accessories"  },
];

// ── Main export ───────────────────────────────────────────────────────────────
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
  const [activeTab, setActiveTab] = useState("all");

  const location = [city, vendorState].filter(Boolean).join(", ");
  const whatsappHref = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=Hi%20${encodeURIComponent(displayName)}%2C%20I%20found%20your%20store%20on%20Fashionistar%21`
    : "";

  return (
    <div className="space-y-10">
      {/* ── Store Info Card ───────────────────────────────────────────────── */}
      <section
        className="rounded-3xl border border-[#ECE6D6] bg-white p-6 shadow-sm"
        aria-labelledby="store-info-heading"
      >
        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {isVerified && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
              style={{ background: `${P.green}18`, color: P.green }}
            >
              <Verified className="h-3.5 w-3.5" /> Verified Vendor
            </span>
          )}
          {isFeatured && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
              style={{ background: `${P.gold}20`, color: P.goldD }}
            >
              <Star className="h-3.5 w-3.5" fill={P.goldD} /> Featured
            </span>
          )}
          {location && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ECE6D6] px-3 py-1 text-xs font-medium text-[#475367]">
              <MapPin className="h-3 w-3" /> {location}
            </span>
          )}
        </div>

        {/* Description */}
        <div className="mb-5">
          <h2 id="store-info-heading" className="text-lg font-bold mb-1.5" style={{ color: P.ink }}>
            {tagline || `${displayName} — Bespoke Fashion Studio`}
          </h2>
          <p className="text-sm leading-7" style={{ color: P.muted }}>
            {description ||
              "A curated fashion studio specialising in bespoke, made-to-measure garments. Each piece is crafted to your exact measurements — combining artisan craftsmanship with contemporary style."}
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-3 mb-5">
          <StatPill value={`${avgRating.toFixed(1)}★`} label="Rating"   icon={Star}        />
          <StatPill value={totalProducts}               label="Products" icon={ShoppingBag}  />
          <StatPill value={`${totalSales}+`}            label="Orders"   icon={Zap}          />
          <StatPill value="< 2h"                        label="Response" icon={MessageCircle}/>
        </div>

        {/* Star rating */}
        {reviewCount > 0 && (
          <div className="mb-5">
            <StarRating value={avgRating} count={reviewCount} />
          </div>
        )}

        {/* Social links */}
        <div className="flex items-center gap-2 flex-wrap">
          <SocialLink href={instagram}  label="Instagram">
            <Instagram className="h-4 w-4" />
          </SocialLink>
          <SocialLink href={twitter}    label="Twitter / X">
            <Twitter className="h-4 w-4" />
          </SocialLink>
          {tiktok && (
            <SocialLink href={tiktok}   label="TikTok">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.77a8.18 8.18 0 0 0 4.78 1.52V6.82a4.85 4.85 0 0 1-1.01-.13z"/>
              </svg>
            </SocialLink>
          )}
          {website && (
            <SocialLink href={website}  label="Website">
              <ExternalLink className="h-4 w-4" />
            </SocialLink>
          )}
          {whatsappHref && (
            <SocialLink href={whatsappHref} label="WhatsApp">
              <MessageCircle className="h-4 w-4" />
            </SocialLink>
          )}
        </div>
      </section>

      {/* ── Custom Sizing CTA ─────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden rounded-3xl p-6 md:p-8"
        style={{ background: `linear-gradient(135deg, ${P.green} 0%, ${P.greenL} 100%)` }}
        aria-label="Custom measurements call-to-action"
      >
        {/* Decorative circles */}
        <div
          className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full opacity-10"
          style={{ background: P.gold }}
        />
        <div
          className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full opacity-10"
          style={{ background: P.gold }}
        />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Ruler className="h-5 w-5" style={{ color: P.gold }} aria-hidden="true" />
              <span
                className="text-xs font-bold uppercase tracking-[0.14em]"
                style={{ color: P.gold }}
              >
                Bespoke Tailoring
              </span>
            </div>
            <h2 className="text-xl font-bold text-white md:text-2xl">
              Want this crafted to your exact measurements?
            </h2>
            <p className="text-sm text-white/70">
              {displayName} accepts custom-sized orders. Share your measurements and get
              a perfectly fitted garment — no returns, no alterations needed.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-shrink-0">
            <Link
              href="/get-measured"
              id="vendor-storefront-get-measured-cta"
              className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-black transition-all hover:scale-105 hover:shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${P.gold} 0%, ${P.goldD} 100%)`,
                boxShadow: `0 4px 16px ${P.gold}50`,
              }}
            >
              <Ruler className="h-4 w-4" />
              Get Measured Free
            </Link>
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                id="vendor-storefront-whatsapp-cta"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
              >
                <MessageCircle className="h-4 w-4" />
                Chat on WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── Collections chips ─────────────────────────────────────────────── */}
      {collections.length > 0 && (
        <section aria-label="Store collections">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest" style={{ color: P.muted }}>
            Collections
          </h2>
          <div className="flex flex-wrap gap-2">
            {collections.map((col) => (
              <Link
                key={col.id}
                href={`/collections/${col.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#ECE6D6] bg-white px-4 py-2 text-sm font-semibold text-[#141414] transition-all hover:border-[#FDA600] hover:text-[#01454A] hover:shadow-sm"
              >
                {col.title}
                <ArrowRight className="h-3 w-3" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Product Grid with Category Tabs ──────────────────────────────── */}
      <section aria-labelledby="products-heading">
        {/* Header row */}
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2
            id="products-heading"
            className="font-bon_foyage text-2xl md:text-3xl capitalize"
            style={{ color: P.ink }}
          >
            {displayName}&apos;s Products
          </h2>
          <Link
            href={`/categories`}
            className="flex items-center gap-1 text-sm font-semibold transition-colors hover:underline"
            style={{ color: P.green }}
          >
            Browse all categories <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Category Tabs */}
        <div
          className="mb-6 flex gap-1 overflow-x-auto pb-1 scrollbar-none"
          role="tablist"
          aria-label="Filter products by category"
        >
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                id={`vendor-tab-${tab.key}`}
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.key)}
                className={[
                  "flex-shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-all outline-none",
                  "focus-visible:ring-2 focus-visible:ring-[#FDA600]/60",
                  isActive
                    ? "text-black shadow-md"
                    : "border border-[#ECE6D6] bg-white text-[#475367] hover:border-[#FDA600]/50",
                ].join(" ")}
                style={isActive ? {
                  background: `linear-gradient(135deg, ${P.gold} 0%, ${P.goldD} 100%)`,
                  boxShadow: `0 4px 12px ${P.gold}40`,
                } : undefined}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Live product grid */}
        <ProductGrid vendorSlug={vendorSlug} activeTab={activeTab} />
      </section>

      {/* ── Start a Custom Order CTA (bottom) ────────────────────────────── */}
      <section className="rounded-3xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 text-center">
        <h2 className="mb-1.5 text-lg font-bold" style={{ color: P.ink }}>
          Don&apos;t see exactly what you need?
        </h2>
        <p className="mb-4 text-sm" style={{ color: P.muted }}>
          {displayName} can create bespoke pieces from scratch. Describe your vision,
          share your measurements, and receive a personalised quote within 24 hours.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href={`/contact-us?vendor=${vendorSlug}&type=custom_order`}
            id="vendor-storefront-custom-order-cta"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-black transition-all hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${P.gold} 0%, ${P.goldD} 100%)`,
              boxShadow: `0 2px 8px ${P.gold}40`,
            }}
          >
            Request Custom Order
          </Link>
          <Link
            href="/get-measured"
            className="inline-flex items-center gap-2 rounded-full border border-[#01454A] px-6 py-3 text-sm font-semibold text-[#01454A] transition-all hover:bg-[#01454A] hover:text-white"
          >
            <Ruler className="h-4 w-4" />
            My Measurements
          </Link>
        </div>
      </section>
    </div>
  );
}
