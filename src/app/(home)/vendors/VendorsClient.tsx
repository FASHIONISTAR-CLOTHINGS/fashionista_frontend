"use client";

/**
 * VendorsClient.tsx — Phase 11: Live Public Vendor Marketplace
 *
 * Fetches real vendors from GET /api/v1/vendor/public/ with:
 *  - Live search (debounced 300ms)
 *  - City & featured filters
 *  - Pagination (24 per page)
 *  - Rating stars display
 *  - FashionistarImage for Cloudinary-aware rendering
 *  - TanStack Query for client-side data fetching
 */

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Star, ShoppingBag, BadgeCheck, Search, SlidersHorizontal, ChevronLeft, ChevronRight, Loader2, Store } from "lucide-react";
import { FashionistarImage } from "@/components/media";
import { vendorApi } from "@/features/vendor/api/vendor.api";
import type { PublicVendorCard } from "@/features/vendor/types/vendor.types";

// ── Badge config ───────────────────────────────────────────────────────────────
function VendorBadge({ vendor }: { vendor: PublicVendorCard }) {
  if (vendor.is_featured)
    return (
      <span className="absolute top-3 left-3 z-10 rounded-full bg-[#FDA600] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-black shadow">
        ✦ Featured
      </span>
    );
  if (vendor.is_verified)
    return (
      <span className="absolute top-3 left-3 z-10 flex items-center gap-1 rounded-full bg-[#01454A] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
        <BadgeCheck size={10} />
        Verified
      </span>
    );
  return null;
}

// ── Rating stars ───────────────────────────────────────────────────────────────
function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={10}
          className={i < Math.round(rating) ? "fill-[#FDA600] text-[#FDA600]" : "fill-none text-[#ccc]"}
        />
      ))}
      <span className="ml-1 text-[10px] font-semibold text-[#7A6B44]">
        {rating.toFixed(1)}
      </span>
    </span>
  );
}

// ── Vendor Card ────────────────────────────────────────────────────────────────
function VendorCard({ vendor }: { vendor: PublicVendorCard }) {
  return (
    <Link
      href={`/vendors/${vendor.store_slug}`}
      className="group relative flex flex-col rounded-2xl border border-[#ECE6D6] bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      {/* Cover / Logo area */}
      <div className="relative h-44 bg-gradient-to-br from-[#01454A]/8 to-[#FDA600]/8 overflow-hidden">
        {vendor.cover_url ? (
          <FashionistarImage
            src={vendor.cover_url}
            alt={`${vendor.store_name} cover`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Store size={48} className="text-[#01454A]/20" />
          </div>
        )}

        {/* Overlay gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Logo bubble */}
        <div className="absolute bottom-3 right-3 h-12 w-12 rounded-full border-2 border-white bg-white shadow-lg overflow-hidden flex items-center justify-center">
          {vendor.logo_url ? (
            <FashionistarImage
              src={vendor.logo_url}
              alt={`${vendor.store_name} logo`}
              width={48}
              height={48}
              className="object-cover rounded-full"
            />
          ) : (
            <Store size={22} className="text-[#01454A]" />
          )}
        </div>

        <VendorBadge vendor={vendor} />
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-raleway font-bold text-base text-[#1A1208] group-hover:text-[#01454A] transition-colors line-clamp-1">
            {vendor.store_name}
          </h3>
        </div>

        {vendor.tagline && (
          <p className="font-raleway text-xs text-[#7A6B44] line-clamp-2 leading-relaxed">
            {vendor.tagline}
          </p>
        )}

        <RatingStars rating={vendor.average_rating} />

        <div className="flex items-center justify-between text-[11px] text-[#7A6B44] font-raleway pt-1 border-t border-[#ECE6D6]">
          <span className="flex items-center gap-1">
            <MapPin size={10} />
            {[vendor.city, vendor.state].filter(Boolean).join(", ") || vendor.country}
          </span>
          <span className="flex items-center gap-1">
            <ShoppingBag size={10} />
            {vendor.total_products} products
          </span>
        </div>

        <div className="mt-1">
          <span className="inline-flex items-center gap-1 font-raleway text-xs font-semibold text-[#01454A] group-hover:gap-2 transition-all">
            Visit Store →
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Skeleton Card ──────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#ECE6D6] bg-white overflow-hidden">
      <div className="h-44 bg-[#ECE6D6]" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-3/4 rounded bg-[#ECE6D6]" />
        <div className="h-3 w-full rounded bg-[#ECE6D6]" />
        <div className="h-3 w-1/2 rounded bg-[#ECE6D6]" />
        <div className="h-3 w-5/6 rounded bg-[#ECE6D6]" />
      </div>
    </div>
  );
}

// ── Debounce hook ──────────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// ── Main Client Component ──────────────────────────────────────────────────────
export function VendorsClient() {
  const [search,      setSearch]      = useState("");
  const [city,        setCity]        = useState("");
  const [isFeatured,  setIsFeatured]  = useState(false);
  const [page,        setPage]        = useState(0);
  const PAGE_SIZE = 24;

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-vendors", debouncedSearch, city, isFeatured, page],
    queryFn:  () =>
      vendorApi.getPublicVendors({
        search:      debouncedSearch || undefined,
        city:        city || undefined,
        is_featured: isFeatured || undefined,
        limit:       PAGE_SIZE,
        offset:      page * PAGE_SIZE,
      }),
    staleTime: 2 * 60_000, // 2 minutes — public data
  });

  const vendors  = data?.results ?? [];
  const total    = data?.count   ?? 0;
  const totalPgs = Math.ceil(total / PAGE_SIZE);

  const resetFilters = useCallback(() => {
    setSearch("");
    setCity("");
    setIsFeatured(false);
    setPage(0);
  }, []);

  return (
    <div>
      {/* ── Filter Bar ────────────────────────────────────────────────────── */}
      <section className="sticky top-0 z-20 border-b border-[#ECE6D6] bg-white/95 backdrop-blur px-5 py-4 md:px-10 lg:px-20">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6B44]" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search vendors…"
              className="w-full rounded-full border border-[#ECE6D6] bg-[#F8F5ED] py-2 pl-9 pr-4 text-sm font-raleway text-[#1A1208] outline-none focus:border-[#01454A] focus:ring-1 focus:ring-[#01454A]/20"
            />
          </div>

          {/* City filter */}
          <div className="relative">
            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6B44]" />
            <input
              value={city}
              onChange={(e) => { setCity(e.target.value); setPage(0); }}
              placeholder="Filter by city…"
              className="w-36 rounded-full border border-[#ECE6D6] bg-[#F8F5ED] py-2 pl-9 pr-4 text-sm font-raleway text-[#1A1208] outline-none focus:border-[#01454A] focus:ring-1 focus:ring-[#01454A]/20"
            />
          </div>

          {/* Featured toggle */}
          <button
            onClick={() => { setIsFeatured((v) => !v); setPage(0); }}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold font-raleway uppercase tracking-wide transition-all ${
              isFeatured
                ? "bg-[#FDA600] text-black shadow"
                : "border border-[#ECE6D6] bg-white text-[#7A6B44] hover:border-[#FDA600]"
            }`}
          >
            <Star size={11} />
            Featured Only
          </button>

          {/* Reset */}
          {(search || city || isFeatured) && (
            <button
              onClick={resetFilters}
              className="rounded-full border border-[#ECE6D6] px-3 py-2 text-xs font-raleway text-[#7A6B44] hover:border-red-400 hover:text-red-500 transition-colors"
            >
              Clear Filters
            </button>
          )}

          <span className="ml-auto font-raleway text-xs text-[#7A6B44]">
            {isLoading ? (
              <Loader2 size={14} className="animate-spin inline-block" />
            ) : (
              `${total.toLocaleString()} vendor${total !== 1 ? "s" : ""}`
            )}
          </span>
        </div>
      </section>

      {/* ── Vendor Grid ───────────────────────────────────────────────────── */}
      <section className="px-5 py-10 md:px-10 lg:px-20">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <SlidersHorizontal size={40} className="text-[#ECE6D6]" />
            <p className="font-raleway text-sm text-[#7A6B44]">
              Could not load vendors. Please try again.
            </p>
            <button
              onClick={resetFilters}
              className="rounded-full bg-[#01454A] px-6 py-2.5 text-xs font-bold text-white hover:opacity-90"
            >
              Retry
            </button>
          </div>
        ) : vendors.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <Store size={48} className="text-[#ECE6D6]" />
            <h3 className="font-bon_foyage text-2xl text-[#1A1208]">No Vendors Found</h3>
            <p className="font-raleway text-sm text-[#7A6B44] max-w-sm">
              Try adjusting your search or filters to discover more artisans.
            </p>
            <button
              onClick={resetFilters}
              className="rounded-full bg-[#FDA600] px-6 py-2.5 text-xs font-bold text-black hover:opacity-90"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vendors.map((v) => <VendorCard key={v.id} vendor={v} />)}
          </div>
        )}

        {/* ── Pagination ─────────────────────────────────────────────────── */}
        {totalPgs > 1 && !isLoading && (
          <div className="mt-12 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ECE6D6] text-[#7A6B44] transition-all hover:border-[#01454A] hover:text-[#01454A] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: Math.min(totalPgs, 7) }).map((_, i) => {
              const pageIdx = totalPgs <= 7 ? i : Math.max(0, Math.min(totalPgs - 7, page - 3)) + i;
              return (
                <button
                  key={pageIdx}
                  onClick={() => setPage(pageIdx)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold font-raleway transition-all ${
                    pageIdx === page
                      ? "bg-[#01454A] text-white shadow"
                      : "border border-[#ECE6D6] text-[#7A6B44] hover:border-[#01454A] hover:text-[#01454A]"
                  }`}
                >
                  {pageIdx + 1}
                </button>
              );
            })}

            <button
              onClick={() => setPage((p) => Math.min(totalPgs - 1, p + 1))}
              disabled={page >= totalPgs - 1}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ECE6D6] text-[#7A6B44] transition-all hover:border-[#01454A] hover:text-[#01454A] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
