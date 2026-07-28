"use client";

/**
 * @file VendorSpotlightCards.tsx
 * @description Spotlight cards for featured vendors in a collection.
 *
 * Psychological triggers:
 *   - Authority: "Verified Vendor" badge
 *   - Social Proof: Product count and rating
 *   - Trust: Vendor transparency
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Store, Star, BadgeCheck, ArrowRight } from "lucide-react";
import { apiAsync } from "@/core/api/client.async";

interface VendorSpotlight {
  id: string;
  business_name: string;
  slug: string;
  logo_url: string | null;
  product_count: number;
  avg_rating: number;
  is_verified: boolean;
}

interface VendorSpotlightCardsProps {
  collectionSlug: string;
}

export function VendorSpotlightCards({ collectionSlug }: VendorSpotlightCardsProps) {
  const [vendors, setVendors] = useState<VendorSpotlight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchVendors = async () => {
      try {
        const res = await apiAsync
          .get(`collections/${collectionSlug}/vendors/`, {
            searchParams: { page_size: "3" },
          })
          .json<{ results: VendorSpotlight[] }>();
        if (active && res.results) {
          setVendors(res.results.slice(0, 3));
        }
      } catch {
        // Silent fail — spotlight cards are optional
      } finally {
        if (active) setLoading(false);
      }
    };
    void fetchVendors();
    return () => { active = false; };
  }, [collectionSlug]);

  if (loading || vendors.length === 0) return null;

  return (
    <section
      className="border-b border-border/50 bg-[#F8F9FC]"
      data-testid="vendor-spotlight-cards"
    >
      <div className="px-5 py-12 md:px-10 lg:px-20">
        <div className="mb-6 flex items-center gap-2">
          <Store size={18} className="text-[#01454A]" />
          <h2 className="font-bon_foyage text-xl text-foreground md:text-2xl">
            Featured Vendors
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.map((vendor) => (
            <Link
              key={vendor.id}
              href={`/vendors/${vendor.slug}`}
              className="group flex flex-col gap-3 rounded-2xl border border-border/40 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted overflow-hidden">
                  {vendor.logo_url ? (
                    <img
                      src={vendor.logo_url}
                      alt={vendor.business_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Store size={20} className="text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-semibold text-foreground">
                    {vendor.business_name}
                  </p>
                  {vendor.is_verified && (
                    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-600">
                      <BadgeCheck size={12} /> Verified Vendor
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Store size={12} />
                  {vendor.product_count} products
                </span>
                {vendor.avg_rating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    {vendor.avg_rating.toFixed(1)}
                  </span>
                )}
              </div>

              <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#01454A] transition group-hover:gap-2">
                Visit Store <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
