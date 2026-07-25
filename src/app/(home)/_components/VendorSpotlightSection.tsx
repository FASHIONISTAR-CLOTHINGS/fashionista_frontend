"use client";

/**
 * VendorSpotlightSection.tsx — Homepage Component 3 (Item 9)
 *
 * "Meet Our Vendors" — 4 featured vendor cards on the homepage.
 * Fetches top 4 vendors ordered by rating/verification status.
 *
 * Design:
 *  - Section header: "Meet Our Vendors" with "View All" link
 *  - 4 cards in a responsive grid (2-col mobile, 4-col desktop)
 *  - Each card: store banner image, avatar, name, city, verified badge,
 *    product count, avg rating stars, dual CTA ("View Store" + "Get Measured")
 *  - Forest green verified badge for is_verified vendors
 *  - Skeleton loading state
 *  - Renders null if no vendor data
 */

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/features/catalog/api/catalog.api";
import type { CatalogVendorCard } from "@/features/catalog/types/catalog.types";
import { BadgeCheck, Star, Package, Ruler } from "lucide-react";

// ─── Single vendor card ───────────────────────────────────────────────────────

function VendorCard({ vendor }: { vendor: CatalogVendorCard }) {
  const storeUrl = `/vendors/${vendor.slug}`;
  const bannerUrl =
    (vendor as unknown as Record<string, string | null>).banner_image_url ||
    (vendor as unknown as Record<string, string | null>).cloudinary_banner_url ||
    null;
  const avatarUrl =
    (vendor as unknown as Record<string, string | null>).avatar_url ||
    (vendor as unknown as Record<string, string | null>).logo_url ||
    null;
  const isVerified = Boolean(
    (vendor as unknown as Record<string, unknown>).is_verified
  );
  const productCount =
    (vendor as unknown as Record<string, number>).cached_product_count ?? 0;
  const avgRating =
    (vendor as unknown as Record<string, number>).avg_rating ?? 0;
  const city =
    (vendor as unknown as Record<string, string>).city ?? "";

  return (
    <article
      className="group flex flex-col rounded-2xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
      data-testid={`vendor-card-${vendor.slug}`}
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
            data-testid={`vendor-view-store-${vendor.slug}`}
            className="flex-1 text-center text-[10px] font-bold font-raleway py-1.5 rounded-full bg-[#01454A] text-white hover:bg-[#FDA600] hover:text-black transition-all duration-150"
          >
            View Store
          </Link>
          <Link
            href={`/get-measured?vendor=${vendor.slug}`}
            data-testid={`vendor-get-measured-${vendor.slug}`}
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function VendorSpotlightSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-5 md:px-10 lg:px-20" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden border border-border bg-card">
          <div className="h-28 bg-muted animate-pulse" />
          <div className="px-4 pt-6 pb-4 space-y-2">
            <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
            <div className="h-2 w-1/2 bg-muted animate-pulse rounded" />
            <div className="h-8 w-full bg-muted animate-pulse rounded-full mt-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

export function VendorSpotlightSection() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["homepage-vendor-spotlight"],
    queryFn: () => catalogApi.getVendors(1, { page_size: "4", ordering: "-avg_rating" }),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const vendors: CatalogVendorCard[] =
    (data as unknown as { results?: CatalogVendorCard[] })?.results ?? [];

  if (!isLoading && (isError || vendors.length === 0)) return null;

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
      {isLoading ? (
        <VendorSpotlightSkeleton />
      ) : (
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 px-5 md:px-10 lg:px-20"
          role="list"
          aria-label="Featured vendors"
        >
          {vendors.slice(0, 4).map((vendor) => (
            <div key={vendor.slug} role="listitem">
              <VendorCard vendor={vendor} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
