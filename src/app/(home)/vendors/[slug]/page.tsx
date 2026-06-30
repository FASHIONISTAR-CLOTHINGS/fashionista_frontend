/**
 * app/(home)/vendors/[slug]/page.tsx
 *
 * Public Vendor Storefront — Server Component shell.
 *
 * Architecture:
 *  • Server Component fetches vendor profile from backend via direct fetch()
 *    (cache-revalidated every 60s for ISR) — no client round-trip for the hero.
 *  • VendorPublicProfileClient renders the live product grid + interaction layer.
 *
 * Performance:
 *  • generateMetadata: rich OG / Twitter card from live vendor data.
 *  • generateStaticParams: pre-renders featured vendor slugs at build time.
 *  • Remaining slugs served via ISR on first request.
 */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  Instagram,
  MapPin,
  MessageCircle,
  Ruler,
  ShoppingBag,
  Star,
  Twitter,
  Verified,
} from "lucide-react";

import { ProductGridSkeleton } from "@/features/product";
import VendorPublicProfileClient from "./VendorPublicProfileClient";

// ── Types ──────────────────────────────────────────────────────────────────────
interface VendorPublicOut {
  id:             string;
  store_name:     string;
  store_slug:     string;
  tagline:        string;
  description:    string;
  logo_url:       string;
  cover_url:      string;
  city:           string;
  state:          string;
  country:        string;
  whatsapp:       string;
  instagram_url:  string;
  tiktok_url:     string;
  twitter_url:    string;
  website_url:    string;
  is_verified:    boolean;
  is_featured:    boolean;
  total_products: number;
  total_sales:    number;
  average_rating: number;
  review_count:   number;
  collections:    Array<{ id: string; title: string; slug: string }>;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ── Data fetching ─────────────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8001";

async function fetchVendorPublicProfile(
  slug: string,
): Promise<VendorPublicOut | null> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/ninja/vendor/public/${slug}/`,
      {
        next: { revalidate: 60, tags: [`vendor-${slug}`] },
        headers: { Accept: "application/json" },
      },
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Vendor API ${res.status}`);
    const payload = await res.json();
    // Unwrap { status, data } envelope if present
    return (payload?.data ?? payload) as VendorPublicOut;
  } catch {
    // Fail gracefully — the client island will still render via client-side hooks
    return null;
  }
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const vendor   = await fetchVendorPublicProfile(slug);
  const name     = vendor?.store_name ?? decodeURIComponent(slug).replace(/-/g, " ");
  const desc     = vendor?.tagline
    ?? `Browse ${name}'s bespoke collection on Fashionistar — Nigeria's premier fashion marketplace.`;

  return {
    title:       `${name} | Fashionistar`,
    description: desc,
    alternates:  { canonical: `/vendors/${slug}` },
    openGraph: {
      title:       `${name} | Fashionistar`,
      description: desc,
      url:         `/vendors/${slug}`,
      type:        "profile",
      images:      vendor?.cover_url
        ? [{ url: vendor.cover_url, width: 1200, height: 630, alt: name }]
        : [],
    },
    twitter: {
      card:        "summary_large_image",
      title:       `${name} | Fashionistar`,
      description: desc,
      images:      vendor?.cover_url ? [vendor.cover_url] : [],
    },
  };
}

// ── Static params (ISR) ───────────────────────────────────────────────────────
export async function generateStaticParams() {
  // Pre-render featured vendors at build time; others are ISR on demand
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/ninja/vendor/public/?featured=true&limit=20`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return [{ slug: "featured-tailor" }];
    const data = await res.json();
    const vendors: Array<{ store_slug: string }> =
      data?.data?.results ?? data?.results ?? [];
    if (vendors.length === 0) return [{ slug: "featured-tailor" }];
    return vendors.map((v) => ({ slug: v.store_slug }));
  } catch {
    return [{ slug: "featured-tailor" }];
  }
}


// ── Store skeleton ─────────────────────────────────────────────────────────────
function StoreSectionSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-40 rounded-3xl bg-[#F0EDE6]" />
      <div className="h-32 rounded-3xl bg-[#F0EDE6]" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-64 rounded-2xl bg-[#F0EDE6]" />
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function VendorStorefrontPage({ params }: PageProps) {
  const { slug } = await params;

  if (!slug) notFound();

  const vendor = await fetchVendorPublicProfile(slug);

  // If 404 from API — show Next.js not-found page
  if (vendor === null) {
    const displayName = decodeURIComponent(slug).replace(/-/g, " ");
    // We don't hard 404 — backend may not have public endpoint yet; gracefully render
    return <GracefulFallback slug={slug} displayName={displayName} />;
  }

  const {
    store_name:     storeName,
    tagline,
    description,
    logo_url:       logoUrl,
    cover_url:      coverUrl,
    city,
    state:          vendorState,
    country,
    whatsapp,
    instagram_url:  instagram,
    tiktok_url:     tiktok,
    twitter_url:    twitterUrl,
    website_url:    website,
    is_verified:    isVerified,
    is_featured:    isFeatured,
    total_products: totalProducts,
    total_sales:    totalSales,
    average_rating: avgRating,
    review_count:   reviewCount,
    collections,
  } = vendor;

  const location     = [city, vendorState, country].filter(Boolean).slice(0, 2).join(", ");
  const initials     = storeName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <div className="bg-[#FAFAF8] text-[#141414]">
      {/* ── Parallax Hero Banner ─────────────────────────────────────────── */}
      <section
        className="relative min-h-[340px] md:min-h-[440px] flex items-end overflow-hidden"
        style={{
          background: coverUrl
            ? undefined
            : "linear-gradient(135deg, #01454A 0%, #1a6b72 60%, #012b2e 100%)",
        }}
        aria-label={`${storeName} storefront hero`}
      >
        {/* Cover image */}
        {coverUrl && (
          <Image
            src={coverUrl}
            alt={`${storeName} cover`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)",
          }}
        />
        {/* Gold shimmer accent */}
        <div
          className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full blur-3xl opacity-30"
          style={{ background: "#FDA600" }}
          aria-hidden="true"
        />

        {/* Hero content */}
        <div className="relative z-10 w-full px-5 pb-10 pt-20 md:px-10 lg:px-20">
          {/* Breadcrumb */}
          <nav
            className="mb-5 flex items-center gap-2 text-xs text-white/60 font-medium"
            aria-label="Breadcrumb"
          >
            <Link href="/"       className="hover:text-[#FDA600] transition-colors">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/vendors" className="hover:text-[#FDA600] transition-colors">Vendors</Link>
            <span aria-hidden="true">/</span>
            <span className="text-white" aria-current="page">{storeName}</span>
          </nav>

          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            {/* Left: Avatar + store name */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              {/* Logo/avatar */}
              <div className="relative h-24 w-24 md:h-28 md:w-28 flex-shrink-0">
                <div className="h-full w-full overflow-hidden rounded-2xl border-2 border-[#FDA600]/60 shadow-xl">
                  {logoUrl ? (
                    <Image
                      src={logoUrl}
                      alt={storeName}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-2xl font-bold text-black"
                      style={{ background: "linear-gradient(135deg, #FDA600 0%, #E89500 100%)" }}
                    >
                      {initials}
                    </div>
                  )}
                </div>
                {isVerified && (
                  <div
                    className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white shadow-md"
                    style={{ background: "#01454A" }}
                    title="Verified Vendor"
                  >
                    <Verified className="h-4 w-4 text-[#FDA600]" />
                  </div>
                )}
              </div>

              {/* Store name + meta */}
              <div className="space-y-2">
                {isFeatured && (
                  <div className="flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 fill-[#FDA600] text-[#FDA600]" />
                    <span className="text-xs font-bold uppercase tracking-widest text-[#FDA600]">
                      Featured Vendor
                    </span>
                  </div>
                )}
                <h1 className="font-bon_foyage text-3xl leading-tight text-white md:text-5xl lg:text-6xl">
                  {storeName}
                </h1>
                {tagline && (
                  <p className="text-sm text-white/70 max-w-md leading-relaxed">{tagline}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
                  {location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <ShoppingBag className="h-3 w-3" /> {totalProducts} products
                  </span>
                  {avgRating > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-[#FDA600] text-[#FDA600]" />
                      {avgRating.toFixed(1)} ({reviewCount} reviews)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: CTAs */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center md:flex-col md:items-end">
              <Link
                href="/get-measured"
                id="vendor-hero-get-measured"
                className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-black shadow-lg transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #FDA600 0%, #E89500 100%)",
                  boxShadow: "0 4px 20px rgba(253,166,0,0.45)",
                }}
              >
                <Ruler className="h-4 w-4" /> Get Measured
              </Link>
              <Link
                href={`/contact-us?vendor=${slug}`}
                id="vendor-hero-contact"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
              >
                <MessageCircle className="h-4 w-4" /> Contact Vendor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quick Info Strip ─────────────────────────────────────────────── */}
      <section className="border-b border-[#ECE6D6] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-10 lg:px-20">
          <div className="flex flex-wrap items-center gap-6 text-sm text-[#475367]">
            {location && (
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#01454A]" /> {location}
              </span>
            )}
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#01454A] transition-colors"
              >
                <MessageCircle className="h-4 w-4 text-[#01454A]" />
                WhatsApp
              </a>
            )}
            {instagram && (
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#FDA600] transition-colors"
              >
                <Instagram className="h-4 w-4" /> Instagram
              </a>
            )}
            {twitterUrl && (
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#1DA1F2] transition-colors"
              >
                <Twitter className="h-4 w-4" /> Twitter/X
              </a>
            )}
          </div>
          {isVerified && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
              style={{ background: "#E8F5E0", color: "#01454A" }}
            >
              <Verified className="h-3.5 w-3.5" /> Verified Vendor
            </span>
          )}
        </div>
      </section>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="px-5 py-10 md:px-10 lg:px-20">
        <Suspense fallback={<StoreSectionSkeleton />}>
          <VendorPublicProfileClient
            vendorSlug={slug}
            displayName={storeName}
            tagline={tagline}
            description={description}
            city={city}
            state={vendorState}
            isVerified={isVerified}
            isFeatured={isFeatured}
            whatsapp={whatsapp}
            instagram={instagram}
            twitter={twitterUrl}
            tiktok={tiktok}
            website={website}
            totalProducts={totalProducts}
            totalSales={totalSales}
            avgRating={avgRating}
            reviewCount={reviewCount}
            collections={collections}
          />
        </Suspense>
      </main>
    </div>
  );
}

// ── Graceful fallback (API unavailable at SSR time) ────────────────────────────
function GracefulFallback({
  slug,
  displayName,
}: {
  slug:        string;
  displayName: string;
}) {
  return (
    <div className="bg-[#FAFAF8] text-[#141414]">
      {/* Simple hero */}
      <section
        className="relative flex min-h-[340px] items-end overflow-hidden"
        style={{ background: "linear-gradient(135deg, #01454A 0%, #1a6b72 100%)" }}
      >
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)" }}
        />
        <div className="relative z-10 w-full px-5 pb-10 md:px-10 lg:px-20">
          <nav className="mb-4 flex items-center gap-2 text-xs text-white/60">
            <Link href="/" className="hover:text-[#FDA600] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/vendors" className="hover:text-[#FDA600] transition-colors">Vendors</Link>
            <span>/</span>
            <span className="text-white">{displayName}</span>
          </nav>
          <h1 className="font-bon_foyage text-4xl text-white capitalize md:text-6xl">
            {displayName}
          </h1>
          <p className="mt-2 text-sm text-white/70">
            Bespoke fashion studio on Fashionistar
          </p>
          <div className="mt-5 flex gap-3">
            <Link
              href="/get-measured"
              className="rounded-2xl px-6 py-3 text-sm font-bold text-black transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #FDA600 0%, #E89500 100%)" }}
            >
              Get Measured
            </Link>
            <Link
              href={`/contact-us?vendor=${slug}`}
              className="rounded-2xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              Contact Vendor
            </Link>
          </div>
        </div>
      </section>

      {/* Client island — fetches products client-side even without SSR data */}
      <main className="px-5 py-10 md:px-10 lg:px-20">
        <Suspense fallback={<ProductGridSkeleton count={8} />}>
          <VendorPublicProfileClient
            vendorSlug={slug}
            displayName={displayName}
          />
        </Suspense>
      </main>
    </div>
  );
}
