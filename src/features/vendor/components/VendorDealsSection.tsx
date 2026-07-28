"use client";

/**
 * @file VendorDealsSection.tsx
 * @description Deals and promotions section for a vendor storefront.
 *
 * Psychological triggers:
 *   - Scarcity: Limited-time offers
 *   - Urgency: Sale countdown
 *   - Value: Discount percentages
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Tag, ArrowRight, Flame } from "lucide-react";
import { apiAsync } from "@/core/api/client.async";

interface DealProduct {
  id: string;
  slug: string;
  name: string;
  price: string;
  old_price: string | null;
  image_url: string | null;
}

interface VendorDealsSectionProps {
  vendorSlug: string;
}

export function VendorDealsSection({ vendorSlug }: VendorDealsSectionProps) {
  const [deals, setDeals] = useState<DealProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchDeals = async () => {
      try {
        const res = await apiAsync
          .get("products/", {
            searchParams: { vendor: vendorSlug, on_sale: "true", page_size: "4" },
          })
          .json<{ results: DealProduct[] }>();
        if (active && res.results) {
          setDeals(res.results.filter((p) => p.old_price && p.old_price !== p.price));
        }
      } catch {
        // Silent fail — deals section is optional
      } finally {
        if (active) setLoading(false);
      }
    };
    void fetchDeals();
    return () => { active = false; };
  }, [vendorSlug]);

  if (loading || deals.length === 0) return null;

  return (
    <section
      className="rounded-[2rem] border border-[#FDA600]/20 bg-gradient-to-br from-[#FFF8E7] to-white p-6 shadow-sm space-y-5"
      data-testid="vendor-deals-section"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame size={20} className="text-[#E89500]" />
          <h3 className="font-bon_foyage text-2xl text-[#01454A]">
            Hot Deals from This Vendor
          </h3>
        </div>
        <Link
          href={`/vendors/${vendorSlug}?filter=sale`}
          className="inline-flex items-center gap-1 text-sm font-bold text-[#01454A] hover:underline"
        >
          View all <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {deals.map((deal) => {
          const discount = deal.old_price
            ? Math.round(
                ((parseFloat(deal.old_price) - parseFloat(deal.price)) /
                  parseFloat(deal.old_price)) *
                  100,
              )
            : 0;
          return (
            <Link
              key={deal.id}
              href={`/products/${deal.slug}`}
              className="group flex flex-col gap-2 rounded-2xl border border-[#ECE6D6] bg-white p-3 shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
                {deal.image_url ? (
                  <img
                    src={deal.image_url}
                    alt={deal.name}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Tag size={24} className="text-muted-foreground" />
                  </div>
                )}
                <span className="absolute top-2 right-2 rounded-full bg-[#FDA600] px-2 py-0.5 text-xs font-black text-black">
                  -{discount}%
                </span>
              </div>
              <p className="line-clamp-2 text-xs font-bold text-foreground">
                {deal.name}
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-black text-[#01454A]">
                  ₦{parseFloat(deal.price).toLocaleString()}
                </span>
                {deal.old_price && (
                  <span className="text-xs text-muted-foreground line-through">
                    ₦{parseFloat(deal.old_price).toLocaleString()}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
