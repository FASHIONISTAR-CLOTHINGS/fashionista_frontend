"use client";

/**
 * VendorSpotlightSection.tsx — Homepage Component 3 (consolidated bundle version)
 *
 * "Meet Our Vendors" — 4 featured vendor cards on the homepage.
 * Now receives vendors as props from the 12-way asyncio.gather bundle —
 * ZERO client-side fetches. Typed empty state when no vendors.
 *
 * Design:
 *  - Section header: "Meet Our Vendors" with "View All" link
 *  - 4 cards in a responsive grid (2-col mobile, 4-col desktop)
 *  - Each card: store banner image, avatar, name, city, verified badge,
 *    product count, avg rating stars, dual CTA ("View Store" + "Get Measured")
 *  - Forest green verified badge for is_verified vendors
 *  - Typed empty state (section never disappears)
 */

import Link from "next/link";
import Image from "next/image";
import type { HomepageVendorCard } from "@/features/catalog/types/catalog.types";
import { BadgeCheck, Star, Package, Ruler, Store } from "lucide-react";

// ─── Single vendor card ───────────────────────────────────────────────────────

function VendorCard({ vendor }: { vendor: HomepageVendorCard }) {
  const storeUrl = `/vendors/${vendor.store_slug}`;
  const bannerUrl = null; // HomepageVendorCard doesn't include banner — use gradient
  const avatarUrl = vendor.logo_url || null;
  const isVerified = Boolean(vendor.is_verified);
  const productCount = vendor.total_products ?? 0;
  const avgRating = vendor.average_rating ?? 0;
  const city = vendor.city ?? "";

  return (
    <article
      className="group flex flex-col rounded-2xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
      data-testid={`vendor-card-${vendor.store_slug}`}
    >
      {/* Banner */}
      <div className="relative h-28 w-full bg-gradient-to-br from-[#01454A] to-[#016B73] overflow-hidden">
        {bannerUrl && (
          <Image
            src={bannerUrl}
            alt={`${vendor.store_name} banner`}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
        {/* Verified badge */}
        {isVerified && (
          <span
            className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-[#01454A] px-2 py-0.5 text-[10px] font-bold text-white shadow"
            aria-label="Verified vendor"
          >
            <BadgeCheck size={10} aria-hidden="true" />
            Verified
          </span>
        )}
      </div>

      {/* Avatar + info */}
      <div className="relative px-4 pb-4 pt-6 flex flex-col gap-2 flex-1">
        {/* Avatar */}
        <div className="absolute -top-6 left-4 h-12 w-12 rounded-full border-2 border-background bg-muted overflow-hidden shadow-md">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={vendor.store_name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xl">
              🏪
            </div>
          )}
        </div>

        {/* Store name */}
        <Link href={storeUrl} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDA600] rounded">
          <h3 className="font-raleway text-sm font-bold text-foreground line-clamp-1 hover:text-[#01454A] transition-colors">
            {vendor.store_name}
          </h3>
        </Link>

        {/* City */}
        {city && (
          <p className="text-[10px] text-muted-foreground font-raleway -mt-1">{city}</p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-raleway">
          {productCount > 0 && (
            <span className="flex items-center gap-0.5">
              <Package size={9} aria-hidden="true" />
              {productCount} products
            </span>
          )}
          {avgRating > 0 && (
            <span className="flex items-center gap-0.5">
              <Star size={9} className="text-[#FDA600]" aria-hidden="true" />
              {avgRating.toFixed(1)}
            </span>
          )}
        </div>

        {/* CTAs */}
        <div className="mt-auto flex gap-2 pt-2">
          <Link
            href={storeUrl}
            data-testid={`vendor-view-store-${vendor.store_slug}`}
            className="flex-1 text-center text-[10px] font-bold font-raleway py-1.5 rounded-full bg-[#01454A] text-white hover:bg-[#FDA600] hover:text-black transition-all duration-150"
          >
            View Store
          </Link>
          <Link
            href={`/get-measured?vendor=${vendor.store_slug}`}
            data-testid={`vendor-get-measured-${vendor.store_slug}`}
            className="flex items-center gap-0.5 text-[10px] font-bold font-raleway py-1.5 px-2 rounded-full border border-[#01454A]/30 text-[#01454A] hover:bg-[#01454A] hover:text-white transition-all duration-150"
          >
            <Ruler size={9} aria-hidden="true" />
            Measure
          </Link>
        </div>
      </div>
    </article>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

export function VendorSpotlightSection({ vendors }: { vendors: HomepageVendorCard[] }) {
  // Typed empty state — section never disappears, degrades gracefully
  if (!vendors || vendors.length === 0) {
    return (
      <section
        className="py-10 bg-[#F4F3EC]/50 border-b border-border/50"
        data-testid="vendor-spotlight-section"
        aria-label="Featured vendors"
      >
        <div className="flex items-center justify-between px-5 mb-6 md:px-10 lg:px-20">
          <div>
            <p className="font-raleway text-xs font-bold uppercase tracking-[0.2em] text-[#FDA600] mb-1">
              Our Creators
            </p>
            <h2 className="font-bon_foyage text-2xl text-foreground md:text-3xl leading-tight">
              Meet Our Vendors
            </h2>
          </div>
          <Link
            href="/vendors"
            data-testid="vendor-spotlight-view-all"
            className="font-raleway text-xs font-bold text-[#01454A] border border-[#01454A]/30 px-4 py-2 rounded-full hover:bg-[#01454A] hover:text-white transition-all duration-150 flex-shrink-0"
          >
            All Vendors →
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
          <Store size={32} className="text-muted-foreground/40 mb-3" aria-hidden="true" />
          <p className="font-raleway text-sm text-muted-foreground">
            Featured vendors are being curated. Check back soon!
          </p>
          <Link
            href="/vendors"
            className="mt-4 font-raleway text-xs font-bold text-[#01454A] border border-[#01454A]/30 px-4 py-2 rounded-full hover:bg-[#01454A] hover:text-white transition-all duration-150"
          >
            Browse All Vendors
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-10 bg-[#F4F3EC]/50 border-b border-border/50"
      data-testid="vendor-spotlight-section"
      aria-label="Featured vendors"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 mb-6 md:px-10 lg:px-20">
        <div>
          <p className="font-raleway text-xs font-bold uppercase tracking-[0.2em] text-[#FDA600] mb-1">
            Our Creators
          </p>
          <h2 className="font-bon_foyage text-2xl text-foreground md:text-3xl leading-tight">
            Meet Our Vendors
          </h2>
        </div>
        <Link
          href="/vendors"
          data-testid="vendor-spotlight-view-all"
          className="font-raleway text-xs font-bold text-[#01454A] border border-[#01454A]/30 px-4 py-2 rounded-full hover:bg-[#01454A] hover:text-white transition-all duration-150 flex-shrink-0"
        >
          All Vendors →
        </Link>
      </div>

      {/* Grid */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 px-5 md:px-10 lg:px-20"
        role="list"
        aria-label="Featured vendors"
      >
        {vendors.slice(0, 4).map((vendor) => (
          <div key={vendor.store_slug} role="listitem">
            <VendorCard vendor={vendor} />
          </div>
        ))}
      </div>
    </section>
  );
}
