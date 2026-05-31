"use client";

import Link from "next/link";
import Image from "next/image";
import { useCollectionVendors } from "@/features/catalog/hooks/use-catalog";
import type { CatalogVendorCard } from "@/features/catalog/types/catalog.types";

interface CollectionVendorClientProps {
  collectionSlug: string;
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function VendorCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-border bg-white p-5 flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-2/3" />
      <div className="flex gap-2 mt-2">
        <div className="h-6 w-20 bg-gray-100 rounded-full" />
        <div className="h-6 w-16 bg-gray-100 rounded-full" />
      </div>
    </div>
  );
}

// ── Vendor card ───────────────────────────────────────────────────────────────
function VendorCard({ vendor }: { vendor: CatalogVendorCard }) {
  const initials = vendor.store_name
    ? vendor.store_name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "V";

  const location = [vendor.city, vendor.state, vendor.country]
    .filter(Boolean)
    .slice(0, 2)
    .join(", ");

  const stars = Math.round(vendor.average_rating);

  return (
    <Link
      href={`/vendors/${vendor.store_slug}`}
      className="group block rounded-2xl border border-border bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5"
    >
      {/* Header: logo + name */}
      <div className="flex items-center gap-4 mb-3">
        <div className="relative h-16 w-16 shrink-0 rounded-full overflow-hidden border-2 border-[hsl(var(--accent))/20] bg-[#f5f3ef]">
          {vendor.logo_url ? (
            <Image
              src={vendor.logo_url}
              alt={`${vendor.store_name} logo`}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-bold text-lg text-[hsl(var(--accent))]">
              {initials}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-raleway font-bold text-base text-[#141414] truncate leading-tight">
              {vendor.store_name || "Unnamed Store"}
            </h3>
            {vendor.is_verified && (
              <span
                title="Verified vendor"
                className="text-[hsl(var(--accent))] text-xs shrink-0"
              >
                ✓
              </span>
            )}
            {vendor.is_featured && (
              <span className="text-[10px] font-semibold bg-[#fda600]/10 text-[#fda600] px-1.5 py-0.5 rounded-full shrink-0">
                FEATURED
              </span>
            )}
          </div>
          {vendor.tagline ? (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {vendor.tagline}
            </p>
          ) : null}
          {location ? (
            <p className="text-[11px] text-muted-foreground/70 mt-0.5">
              📍 {location}
            </p>
          ) : null}
        </div>
      </div>

      {/* Description */}
      {vendor.description ? (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
          {vendor.description}
        </p>
      ) : null}

      {/* Stats row */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
        {vendor.total_products > 0 && (
          <span className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-full">
            🛍️ {vendor.total_products} product{vendor.total_products !== 1 ? "s" : ""}
          </span>
        )}
        {vendor.average_rating > 0 && (
          <span className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-full">
            {"★".repeat(stars)}{"☆".repeat(5 - stars)}{" "}
            {vendor.average_rating.toFixed(1)}
            {vendor.review_count > 0 ? ` (${vendor.review_count})` : ""}
          </span>
        )}
      </div>

      {/* CTA */}
      <div className="mt-4 text-right">
        <span className="inline-block text-xs font-semibold text-[hsl(var(--accent))] group-hover:underline transition-all">
          Visit Store →
        </span>
      </div>
    </Link>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyVendors() {
  return (
    <div className="py-20 text-center space-y-3">
      <div className="text-5xl">🏪</div>
      <p className="font-raleway font-semibold text-lg text-foreground">
        No vendors in this collection yet
      </p>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        Vendors who specialise in this collection will appear here once they
        join Fashionistar.
      </p>
      <Link
        href="/vendors"
        className="inline-block mt-4 rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        Browse All Vendors
      </Link>
    </div>
  );
}

// ── Main client component ─────────────────────────────────────────────────────
/**
 * CollectionVendorClient
 *
 * Renders vendors that have registered under this collection (M2M on VendorProfile).
 * Collections do NOT directly hold products — they link to VendorProfiles.
 * Page state URL-synced for bookmarkable pagination.
 */
export default function CollectionVendorClient({
  collectionSlug,
}: CollectionVendorClientProps) {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useCollectionVendors(collectionSlug);

  // Flatten all pages of vendors
  const vendors: CatalogVendorCard[] =
    data?.pages.flatMap((p) => p.results) ?? [];
  const totalCount = data?.pages[0]?.count ?? 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <VendorCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!vendors.length) {
    return <EmptyVendors />;
  }

  return (
    <div className="space-y-8">
      {/* Count header */}
      <p className="text-sm text-muted-foreground">
        {totalCount} vendor{totalCount !== 1 ? "s" : ""} in this collection
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor) => (
          <VendorCard key={vendor.id} vendor={vendor} />
        ))}
      </div>

      {/* Load more */}
      {hasNextPage ? (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded-full border border-[hsl(var(--accent))] px-8 py-3 text-sm font-semibold text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] transition-colors disabled:opacity-50"
          >
            {isFetchingNextPage ? "Loading…" : "Load More Vendors"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
