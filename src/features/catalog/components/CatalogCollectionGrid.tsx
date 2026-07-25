/**
 * features/catalog/components/CatalogCollectionGrid.tsx
 *
 * C10 — APEX Sprint: Editorial Large-Card Redesign
 *
 * Layout: 3-column desktop, 2-column tablet, 1-column mobile
 * Each card:
 *   - Full background_image / background_cloudinary_url as card backdrop
 *   - Gradient overlay (bottom-up) for text legibility
 *   - Seasonal badge (is_active_now / coming soon / archive)
 *   - Product count chip
 *   - banner_cta_text from backend (or default "Explore")
 *   - is_featured sort: featured collections first
 *
 * RSC — no client JS overhead.
 */

import Link from "next/link";
import { Clock, Package, ChevronRight, Sparkles, Users } from "lucide-react";
import { FashionistarImage } from "@/components/media";
import { getCatalogCollections } from "../api/catalog.server";
import type { HomepageCollectionCard, CatalogCollection } from "../types/catalog.types";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

type CollectionItem = HomepageCollectionCard | CatalogCollection;

function resolveBackground(item: CollectionItem): string | null {
  // Prefer background image (full bleed editorial)
  const bgCandidates = [
    (item as CatalogCollection).background_cloudinary_url,
    (item as CatalogCollection).background_image_url,
    (item as CatalogCollection).background_image,
  ];
  for (const c of bgCandidates) {
    if (c && !c.endsWith("/media/None") && !c.endsWith("/media/null") && c !== "null") {
      return c;
    }
  }
  // Fall back to icon image
  const candidates = [
    (item as HomepageCollectionCard).cloudinary_url,
    (item as HomepageCollectionCard).image_url,
    (item as HomepageCollectionCard).image,
  ];
  for (const c of candidates) {
    if (c && !c.endsWith("/media/None") && !c.endsWith("/media/null") && c !== "null") {
      return c;
    }
  }
  return null;
}

function getSeasonalBadge(item: CollectionItem): { label: string; color: string } | null {
  const col = item as CatalogCollection;
  if (!col.start_date && !col.end_date) return null;

  const now = Date.now();
  const start = col.start_date ? new Date(col.start_date).getTime() : null;
  const end = col.end_date ? new Date(col.end_date).getTime() : null;

  if (start && start > now) {
    return { label: "Coming Soon", color: "bg-[#7C3AED]" };
  }
  if (end && end < now) {
    return { label: "Archived", color: "bg-[#6B7280]" };
  }
  if (end) {
    // Active with end date — compute days remaining
    const daysLeft = Math.ceil((end - now) / 86_400_000);
    if (daysLeft <= 7) {
      return { label: `Ends in ${daysLeft}d`, color: "bg-[#DC2626]" };
    }
    return { label: "Active Now", color: "bg-[#059669]" };
  }
  return { label: "Live", color: "bg-[#01454A]" };
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton — mirrors editorial card proportions
// ─────────────────────────────────────────────────────────────────────────────

export function CatalogCollectionGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <section className="section-wrapper" aria-busy="true" aria-label="Loading collections">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="shimmer h-3 w-24 rounded mb-2" />
          <div className="shimmer h-8 w-64 rounded" />
          <div className="shimmer h-4 w-80 rounded mt-2" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="shimmer rounded-3xl h-72 w-full" />
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Editorial Collection Card
// ─────────────────────────────────────────────────────────────────────────────

function EditorialCollectionCard({
  item,
  index,
  priority = false,
}: {
  item: CollectionItem;
  index: number;
  priority?: boolean;
}) {
  const imgSrc = resolveBackground(item);
  const seasonalBadge = getSeasonalBadge(item);
  const staggerClass = `stagger-${Math.min(index + 1, 12)}`;
  const productCount = (item as CatalogCollection).cached_product_count;
  const vendorCount = (item as CatalogCollection).vendor_count ?? (item as unknown as { vendors_count?: number }).vendors_count;
  const ctaText = (item as CatalogCollection).banner_cta_text || "Explore Collection";
  const subTitle = (item as CatalogCollection).sub_title;
  const isFeatured = (item as CatalogCollection).is_featured;

  return (
    <Link
      href={`/collections/${item.slug}`}
      role="listitem"
      data-testid="collection-card"
      aria-label={`Browse ${item.title} collection`}
      className={`
        group relative flex flex-col justify-end rounded-3xl overflow-hidden
        cursor-pointer h-72 sm:h-80 lg:h-88
        animate-card-enter ${staggerClass}
        shadow-md hover:shadow-2xl transition-shadow duration-500
        focus-visible:outline-2 focus-visible:outline-[var(--BV-gold)] focus-visible:outline-offset-2
      `}
    >
      {/* ── Background image ────────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#01454A]/80 to-[#141414]/60">
        {imgSrc ? (
          <FashionistarImage
            src={imgSrc}
            alt={item.title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            showBlurUp={false}
          />
        ) : (
          /* Branded gradient fallback */
          <div className="absolute inset-0 bg-gradient-to-br from-[#01454A] via-[#0a6b72] to-[#FDA600]/30" />
        )}
        {/* Gradient overlay — bottom-up for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>

      {/* ── Top badges row ───────────────────────────────────────────────── */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2 z-10">
        {/* Featured sparkle badge */}
        {isFeatured && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#FDA600] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-black shadow">
            <Sparkles size={9} />
            Featured
          </span>
        )}

        {/* Seasonal badge */}
        {seasonalBadge && (
          <span
            className={`inline-flex items-center gap-1 rounded-full ${seasonalBadge.color} px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow ml-auto`}
          >
            <Clock size={9} />
            {seasonalBadge.label}
          </span>
        )}
      </div>

      {/* ── Card body — bottom anchored text ────────────────────────────── */}
      <div className="relative z-10 flex flex-col gap-2 p-5 pt-16">
        {/* Product count chip */}
        {productCount != null && productCount > 0 && (
          <span className="inline-flex items-center gap-1 self-start rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-2.5 py-0.5 text-[10px] font-semibold text-white/90">
            <Package size={9} />
            {productCount.toLocaleString()} piece{productCount !== 1 ? "s" : ""}
          </span>
        )}

        {/* Vendor count chip */}
        {vendorCount != null && vendorCount > 0 && (
          <span className="inline-flex items-center gap-1 self-start rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-2.5 py-0.5 text-[10px] font-semibold text-white/90">
            <Users size={9} />
            {vendorCount} vendor{vendorCount !== 1 ? "s" : ""}
          </span>
        )}

        {/* Title */}
        <h3 className="font-bon_foyage text-xl sm:text-2xl font-bold text-white leading-tight line-clamp-2 group-hover:text-[#FDA600] transition-colors duration-300">
          {item.title}
        </h3>

        {/* Sub-title */}
        {subTitle && (
          <p className="text-sm text-white/75 leading-snug line-clamp-2">
            {subTitle}
          </p>
        )}

        {/* CTA row */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/15">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#FDA600] group-hover:gap-3 transition-all duration-300">
            {ctaText}
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
          </span>
        </div>
      </div>

      {/* ── Hover border glow ────────────────────────────────────────────── */}
      <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-[#FDA600]/50 transition-colors duration-300 pointer-events-none" />
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface CatalogCollectionGridProps {
  /** Pre-fetched from HomepageBundle (avoids double-fetch). */
  collections?: HomepageCollectionCard[];
  limit?: number;
  showCta?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component (RSC)
// ─────────────────────────────────────────────────────────────────────────────

export default async function CatalogCollectionGrid({
  collections: collectionsProp,
  limit,
  showCta = true,
}: CatalogCollectionGridProps) {
  const rawCollections = collectionsProp ?? (await getCatalogCollections());

  // Sort: featured first, then by sort_order, then by created_at
  const sorted = [...rawCollections].sort((a, b) => {
    const aFeat = (a as CatalogCollection).is_featured ? 1 : 0;
    const bFeat = (b as CatalogCollection).is_featured ? 1 : 0;
    if (aFeat !== bFeat) return bFeat - aFeat;
    const aOrder = (a as CatalogCollection).sort_order ?? 999;
    const bOrder = (b as CatalogCollection).sort_order ?? 999;
    return aOrder - bOrder;
  });

  const items = limit ? sorted.slice(0, limit) : sorted;

  return (
    <section
      className="section-wrapper"
      aria-labelledby="collections-heading"
      id="latest-collections"
    >
      {/* ── Section Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 animate-slide-up gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--BV-gold)] mb-1">
            Vendor Collections
          </p>
          <h2 id="collections-heading" className="section-title">
            Latest Collections
          </h2>
          <p className="mt-1 text-sm text-[var(--BV-muted)] max-w-md">
            Curated vendor drops — ready-to-wear, custom tailoring, and premium showcases.
          </p>
        </div>
        {showCta && (
          <Link
            href="/collections"
            className="text-sm font-semibold text-[var(--BV-green)] hover:text-[var(--BV-green-light)] underline underline-offset-4 decoration-[var(--BV-gold)] transition-colors duration-200 whitespace-nowrap"
            aria-label="View all vendor collections"
          >
            All collections →
          </Link>
        )}
      </div>

      {items.length > 0 ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          role="list"
          aria-label="Vendor collections"
        >
          {items.map((item, idx) => (
            <EditorialCollectionCard
              key={item.id}
              item={item}
              index={idx}
              priority={idx < 3}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-[var(--BV-border)] bg-[var(--BV-surface)] px-6 py-14 text-center">
          <p className="text-2xl font-bold text-[var(--BV-ink)]">Collections Will Appear Here Soon</p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--BV-muted)] md:text-base">
            We only show live published collections on this surface. Once they are available, they
            will appear here automatically.
          </p>
        </div>
      )}

      {/* ── CTA Button ──────────────────────────────────────────────────── */}
      {showCta && items.length > 0 && (
        <div className="flex justify-center mt-10">
          <Link
            href="/collections"
            className="btn-primary px-10 py-3 text-sm"
            aria-label="Browse all vendor collections"
          >
            See All Collections
          </Link>
        </div>
      )}
    </section>
  );
}
