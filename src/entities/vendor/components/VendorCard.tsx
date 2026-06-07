"use client";

/**
 * src/entities/vendor/components/VendorCard.tsx
 * Glassmorphism vendor profile card for marketplace listings.
 */


import type { VendorCard as TVendorCard, VendorTier } from "../types";


const TIER_CONFIG: Record<VendorTier, { label: string; color: string; icon: string }> = {
  standard: { label: "Standard", color: "text-slate-400", icon: "🧵" },
  silver: { label: "Silver", color: "text-slate-300", icon: "⚡" },
  gold: { label: "Gold", color: "text-amber-400", icon: "⭐" },
  platinum: { label: "Platinum", color: "text-violet-400", icon: "💎" },
  enterprise: { label: "Enterprise", color: "text-rose-400", icon: "🏆" },
};

interface VendorCardProps {
  vendor: TVendorCard;
  onClick?: (slug: string) => void;
  className?: string;
}

export function VendorCard({ vendor, onClick, className = "" }: VendorCardProps) {
  const tier = TIER_CONFIG[vendor.tier] ?? TIER_CONFIG.standard;

  return (
    <article
      onClick={() => onClick?.(vendor.slug)}
      className={`group relative rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md overflow-hidden cursor-pointer
        transition-all duration-300 hover:bg-white/8 hover:border-amber-500/30 hover:shadow-xl hover:shadow-amber-500/10
        hover:-translate-y-1 ${className}`}
      id={`vendor-card-${vendor.id}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.(vendor.slug)}
      aria-label={`View ${vendor.shopName} profile`}
    >
      {/* Banner / gradient fallback */}
      <div className="h-20 bg-gradient-to-r from-amber-600/20 via-violet-600/20 to-rose-600/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/80" />
        {/* Tier badge */}
        <div className={`absolute top-2 right-2 flex items-center gap-1 text-xs font-semibold ${tier.color}`}>
          <span>{tier.icon}</span>
          <span>{tier.label}</span>
        </div>
      </div>

      {/* Logo */}
      <div className="px-4 -mt-8 mb-3 relative z-10">
        <div className="w-14 h-14 rounded-2xl border-2 border-white/20 bg-slate-800 shadow-xl flex items-center justify-center overflow-hidden">
          {vendor.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={vendor.logo} alt={vendor.shopName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">🧵</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-white text-sm leading-tight group-hover:text-amber-300 transition-colors">
            {vendor.shopName}
          </h3>
          {vendor.isVerified && (
            <span className="flex-shrink-0 text-xs text-emerald-400" title="Verified Vendor">✓</span>
          )}
        </div>

        <p className="text-xs text-slate-400">
          📍 {vendor.city}, {vendor.state}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`text-xs ${i < Math.round(vendor.rating) ? "text-amber-400" : "text-slate-600"}`}>
                ★
              </span>
            ))}
          </div>
          <span className="text-xs text-slate-400">
            {vendor.rating.toFixed(1)} ({vendor.reviewCount})
          </span>
        </div>

        {/* Specialties */}
        {vendor.specialties?.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {vendor.specialties.slice(0, 3).map((s) => (
              <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 border border-white/10 text-slate-300">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

/**
 * VendorBadge — inline badge showing shop name + verification status.
 * Used in product cards and order summaries.
 */
export function VendorBadge({
  shopName,
  isVerified,
  tier,
}: {
  shopName: string;
  isVerified?: boolean;
  tier?: VendorTier;
}) {
  const tierConfig = tier ? TIER_CONFIG[tier] : null;
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/8 border border-white/10 text-xs text-slate-300">
      {tierConfig && <span>{tierConfig.icon}</span>}
      <span className="font-medium">{shopName}</span>
      {isVerified && <span className="text-emerald-400 font-bold">✓</span>}
    </div>
  );
}
