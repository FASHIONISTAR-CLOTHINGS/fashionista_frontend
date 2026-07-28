"use client";

/**
 * @file VendorComparison.tsx
 * @description Side-by-side comparison of the current vendor with similar vendors.
 *
 * Psychological triggers:
 *   - Social Proof: Comparative metrics
 *   - Authority: Standing among peers
 *   - Trust: Transparent comparison data
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { GitCompare, Star, ShoppingBag, TrendingUp, ArrowRight } from "lucide-react";
import { apiAsync } from "@/core/api/client.async";

interface ComparisonVendor {
  id: string;
  business_name: string;
  slug: string;
  logo_url: string | null;
  total_products: number;
  avg_rating: number;
  review_count: number;
  is_verified: boolean;
}

interface VendorComparisonProps {
  vendorSlug: string;
  displayName: string;
  totalProducts: number;
  avgRating: number;
  reviewCount: number;
  isVerified: boolean;
}

export function VendorComparison({
  vendorSlug,
  displayName,
  totalProducts,
  avgRating,
  reviewCount,
  isVerified,
}: VendorComparisonProps) {
  const [others, setOthers] = useState<ComparisonVendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchSimilar = async () => {
      try {
        const res = await apiAsync
          .get("vendors/", {
            searchParams: { page_size: "4", exclude: vendorSlug },
          })
          .json<{ results: ComparisonVendor[] }>();
        if (active && res.results) {
          setOthers(res.results.slice(0, 3));
        }
      } catch {
        // Silent fail — comparison is optional
      } finally {
        if (active) setLoading(false);
      }
    };
    void fetchSimilar();
    return () => { active = false; };
  }, [vendorSlug]);

  if (loading || others.length === 0) return null;

  const allVendors: ComparisonVendor[] = [
    {
      id: "current",
      business_name: displayName,
      slug: vendorSlug,
      logo_url: null,
      total_products: totalProducts,
      avg_rating: avgRating,
      review_count: reviewCount,
      is_verified: isVerified,
    },
    ...others,
  ];

  const maxProducts = Math.max(...allVendors.map((v) => v.total_products));
  const maxRating = Math.max(...allVendors.map((v) => v.avg_rating));

  return (
    <section
      className="rounded-[2rem] border border-[#ECE6D6] bg-white p-6 shadow-sm space-y-5"
      data-testid="vendor-comparison-section"
    >
      <div className="flex items-center gap-2">
        <GitCompare size={20} className="text-[#01454A]" />
        <h3 className="font-bon_foyage text-2xl text-[#01454A]">
          How {displayName} Compares
        </h3>
      </div>

      <p className="text-sm text-[#7A6B44]">
        Compare this vendor with similar boutiques on Fashionistar.
      </p>

      {/* Comparison table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#ECE6D6]">
              <th className="py-3 px-2 text-left font-bold text-[#01454A]">Vendor</th>
              <th className="py-3 px-2 text-center font-bold text-[#01454A]">
                <span className="flex items-center justify-center gap-1">
                  <Star size={14} className="fill-[#FDA600] text-[#FDA600]" /> Rating
                </span>
              </th>
              <th className="py-3 px-2 text-center font-bold text-[#01454A]">
                <span className="flex items-center justify-center gap-1">
                  <ShoppingBag size={14} /> Products
                </span>
              </th>
              <th className="py-3 px-2 text-center font-bold text-[#01454A]">
                <span className="flex items-center justify-center gap-1">
                  <TrendingUp size={14} /> Reviews
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {allVendors.map((vendor) => {
              const isCurrent = vendor.slug === vendorSlug;
              return (
                <tr
                  key={vendor.id}
                  className={`border-b border-[#ECE6D6]/50 ${isCurrent ? "bg-[#F8F5ED]" : ""}`}
                >
                  <td className="py-3 px-2">
                    <Link
                      href={isCurrent ? "#" : `/vendors/${vendor.slug}`}
                      className={`flex items-center gap-2 ${isCurrent ? "pointer-events-none" : "hover:underline"}`}
                    >
                      <span className={`font-bold ${isCurrent ? "text-[#01454A]" : "text-foreground"}`}>
                        {vendor.business_name}
                      </span>
                      {isCurrent && (
                        <span className="rounded-full bg-[#01454A] px-2 py-0.5 text-[10px] font-black text-white">
                          YOU
                        </span>
                      )}
                    </Link>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-bold text-foreground">
                        {vendor.avg_rating > 0 ? vendor.avg_rating.toFixed(1) : "—"}
                      </span>
                      {vendor.avg_rating >= maxRating && vendor.avg_rating > 0 && (
                        <span className="text-xs">🏆</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-bold text-foreground">{vendor.total_products}</span>
                      {vendor.total_products >= maxProducts && vendor.total_products > 0 && (
                        <span className="text-xs">🏆</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center font-bold text-foreground">
                    {vendor.review_count > 0 ? vendor.review_count : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Link
        href="/vendors"
        className="inline-flex items-center gap-1 text-sm font-bold text-[#01454A] hover:underline"
      >
        Browse all vendors <ArrowRight size={14} />
      </Link>
    </section>
  );
}
