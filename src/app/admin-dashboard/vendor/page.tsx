"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useAdminVendors,
  useAdminVendorDetail,
  useApproveVendor,
  useSuspendVendor,
  useReactivateVendor,
  useToggleVendorFeatured,
  useUpdateVendorCommission,
} from "@/features/vendor";
import {
  Search,
  MapPin,
  Star,
  ShoppingBag,
  Sparkles,
  Award,
  CheckCircle2,
  TrendingUp,
  ExternalLink,
  FilterX,
  Loader2,
  Store,
  ChevronRight,
  XCircle,
  Lock,
  Unlock,
  Percent,
} from "lucide-react";

export default function AdminSellersPage() {
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [isFeaturedFilter, setIsFeaturedFilter] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [commissionRate, setCommissionRate] = useState<number>(10);

  // ── Query: Fetch Live Vendor Profiles from Admin endpoint ──────────────────
  const { data, isLoading, isError, refetch } = useAdminVendors({
    is_featured: isFeaturedFilter || undefined,
    country: undefined, // Add filter if needed
    search: search.trim() || undefined,
    page: 1,
    page_size: 100,
  });

  // ── Query: Fetch Single Vendor Detail ─────────────────────────────────────
  const { data: selectedVendor } = useAdminVendorDetail(selectedVendorId);

  // ── Mutation hooks ────────────────────────────────────────────────────────
  const approveVendorMutation = useApproveVendor();
  const suspendVendorMutation = useSuspendVendor();
  const reactivateVendorMutation = useReactivateVendor();
  const toggleFeaturedMutation = useToggleVendorFeatured();
  const updateCommissionMutation = useUpdateVendorCommission();

  const sellers = data?.results || [];

  const clearFilters = () => {
    setSearch("");
    setCityFilter("");
    setIsFeaturedFilter(false);
  };

  const handleApprove = (vendor: any) => {
    approveVendorMutation.mutate({ vendorId: vendor.id });
  };

  const handleToggleSuspend = (vendor: any) => {
    if (vendor.is_active) {
      suspendVendorMutation.mutate({ vendorId: vendor.id, reason: "Administrative suspension" });
    } else {
      reactivateVendorMutation.mutate({ vendorId: vendor.id });
    }
  };

  const handleToggleFeatured = (vendor: any) => {
    toggleFeaturedMutation.mutate({ vendorId: vendor.id, featured: !vendor.is_featured });
  };

  const handleUpdateCommission = (vendor: any) => {
    updateCommissionMutation.mutate({ vendorId: vendor.id, commissionRate });
  };

  // Helper to render star rating stars
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} className="w-3.5 h-3.5 fill-[#FDA600] text-[#FDA600]" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <div key={i} className="relative inline-block">
            <Star className="w-3.5 h-3.5 text-[#D9D9D9]" />
            <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
              <Star className="w-3.5 h-3.5 fill-[#FDA600] text-[#FDA600]" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} className="w-3.5 h-3.5 text-[#D9D9D9]" />);
      }
    }
    return stars;
  };

  return (
    <div className="space-y-10 bg-inherit min-h-screen pb-12">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bon_foyage text-4xl text-black md:text-5xl">
            Sellers Boutique
          </h3>
          <p className="font-satoshi text-sm text-[#5A6465] mt-1">
            Supervise the luxury tailor boutiques, monitor review metrics, and spotlight prominent designers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="border border-[#ECE6D6] bg-white hover:bg-[#F4F3EC] text-black font-satoshi font-bold transition-all duration-200 px-5 py-3 rounded-xl shadow-sm text-sm"
          >
            Refresh Directory
          </button>
        </div>
      </div>

      {/* Main Grid Container */}
      <div className="w-full bg-[#F8F5ED]/40 border border-[#ECE6D6] rounded-[32px] p-6 md:p-8 space-y-6">
        
        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Keyword Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A9596]" />
            <input
              type="text"
              placeholder="Search by store name, tagline, aesthetics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white border border-[#ECE6D6] focus:border-[#01454A] rounded-2xl outline-none font-satoshi text-sm text-black placeholder:text-[#8A9596] transition-all"
            />
          </div>

          {/* City Selector */}
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A9596]" />
            <input
              type="text"
              placeholder="City (e.g. Lagos)"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white border border-[#ECE6D6] focus:border-[#01454A] rounded-2xl outline-none font-satoshi text-sm text-black placeholder:text-[#8A9596] transition-all"
            />
          </div>

          {/* Featured Filter Checkbox */}
          <label className="flex items-center gap-3 h-12 bg-white border border-[#ECE6D6] rounded-2xl px-4 cursor-pointer hover:bg-white/80 transition-colors select-none">
            <input
              type="checkbox"
              checked={isFeaturedFilter}
              onChange={(e) => setIsFeaturedFilter(e.target.checked)}
              className="w-4.5 h-4.5 rounded text-[#01454A] focus:ring-[#01454A] accent-[#01454A] cursor-pointer"
            />
            <div className="flex items-center gap-1.5 font-satoshi text-sm text-black">
              <Sparkles className="w-4 h-4 text-[#FDA600] fill-[#FDA600]" />
              <span>Featured Only</span>
            </div>
          </label>
        </div>

        {/* Action Controls & Metric */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#ECE6D6]/60">
          <div className="flex items-center gap-2 font-satoshi text-xs font-semibold text-[#5A6465]">
            <Award className="w-4 h-4 text-[#01454A]" />
            <span>Found {sellers.length} registered boutiques</span>
          </div>

          {(search || cityFilter || isFeaturedFilter) && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs font-bold text-[#01454A] hover:text-black transition"
            >
              <FilterX className="w-3.5 h-3.5" />
              Clear Filters
            </button>
          )}
        </div>

        {/* Loading / Error States */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-10 h-10 text-[#01454A] animate-spin" />
            <p className="font-satoshi text-sm text-[#5A6465] animate-pulse">Retrieving tailored boutiques...</p>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto space-y-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-full">
              <XCircle className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bon_foyage text-xl text-black">Aesthetics Desk Failure</p>
              <p className="font-satoshi text-sm text-[#5A6465] mt-1">
                Unable to load vendor records. Please check database tables mapping and server status.
              </p>
            </div>
          </div>
        )}

        {/* Empty List Grid */}
        {!isLoading && !isError && sellers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto space-y-3 bg-white border border-dashed border-[#ECE6D6] rounded-[24px]">
            <Store className="w-10 h-10 text-[#8A9596]" />
            <p className="font-bon_foyage text-2xl text-black">No Boutiques Found</p>
            <p className="font-satoshi text-sm text-[#5A6465]">
              No tailoring houses matched your city keywords or featured selections.
            </p>
          </div>
        )}

        {/* Sellers Grid */}
        {!isLoading && !isError && sellers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sellers.map((vendor) => {
              return (
                <div
                  key={vendor.id}
                  onClick={() => {
                    setSelectedVendorId(vendor.id);
                  }}
                  className="bg-white border border-[#ECE6D6] hover:border-[#01454A] rounded-[28px] overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
                >
                  {/* Backdrop banner */}
                  <div className="relative h-32 w-full overflow-hidden bg-gradient-to-tr from-[#01454A] to-[#FDA600]/30">
                    
                    {/* Badge Overlay */}
                    <div className="absolute top-4 right-4 flex flex-col gap-1.5 items-end">
                      {vendor.is_featured && (
                        <span className="flex items-center gap-1 bg-[#FDA600] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          <Sparkles className="w-3 h-3 fill-white" />
                          SPOTLIGHT
                        </span>
                      )}
                      {vendor.is_verified && (
                        <span className="flex items-center gap-0.5 bg-[#01454A] text-[#F8F5ED] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          <CheckCircle2 className="w-3 h-3 text-[#FDA600]" />
                          VERIFIED
                        </span>
                      )}
                      {!vendor.is_active && (
                        <span className="flex items-center gap-0.5 bg-red-600 text-[#F8F5ED] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          SUSPENDED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Boutique Details container */}
                  <div className="p-6 pt-0 relative flex-1 flex flex-col justify-between">
                    {/* Floating Store Logo */}
                    <div className="relative -top-8 left-0 z-10 inline-block w-16 h-16 rounded-2xl overflow-hidden border-2 border-white bg-white shadow">
                      <div className="w-full h-full bg-[#01454A]/5 flex items-center justify-center text-[#01454A] font-bon_foyage text-xl">
                        {vendor.store_name?.[0]?.toUpperCase() || "B"}
                      </div>
                    </div>

                    {/* Meta section */}
                    <div className="-mt-5 space-y-2 flex-1">
                      <h4 className="font-bon_foyage text-2xl text-black group-hover:text-[#01454A] transition-colors leading-tight">
                        {vendor.store_name}
                      </h4>
                      {vendor.tagline && (
                        <p className="font-satoshi text-xs text-[#5A6465] line-clamp-1 italic">
                          "{vendor.tagline}"
                        </p>
                      )}
                      {vendor.description && (
                        <p className="font-satoshi text-xs text-[#8A9596] line-clamp-2 leading-relaxed">
                          {vendor.description}
                        </p>
                      )}
                    </div>

                    {/* Perform details footer */}
                    <div className="pt-4 mt-4 border-t border-[#ECE6D6]/60 grid grid-cols-3 gap-2 text-center">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-0.5 text-[#FDA600] font-satoshi text-xs font-bold">
                          <Star className="w-3 h-3 fill-[#FDA600]" />
                          <span>{Number(vendor.average_rating || 0).toFixed(1)}</span>
                        </div>
                        <span className="text-[9px] font-bold text-[#8A9596] uppercase tracking-wider mt-0.5">
                          {vendor.review_count || 0} reviews
                        </span>
                      </div>

                      <div className="flex flex-col items-center border-x border-[#ECE6D6]/60">
                        <div className="flex items-center gap-0.5 text-[#01454A] font-satoshi text-xs font-bold">
                          <ShoppingBag className="w-3 h-3" />
                          <span>{vendor.total_products || 0}</span>
                        </div>
                        <span className="text-[9px] font-bold text-[#8A9596] uppercase tracking-wider mt-0.5">
                          Products
                        </span>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-0.5 text-black font-satoshi text-xs font-bold">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{vendor.total_sales || 0}</span>
                        </div>
                        <span className="text-[9px] font-bold text-[#8A9596] uppercase tracking-wider mt-0.5">
                          Sales
                        </span>
                      </div>
                    </div>

                    {/* Map footer */}
                    <div className="pt-3 mt-3 border-t border-[#ECE6D6]/30 flex items-center justify-between text-[10px] font-satoshi text-[#8A9596]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#FDA600]" />
                        {[vendor.city, vendor.state].filter(Boolean).join(", ")}
                      </span>
                      <span className="font-bold flex items-center gap-0.5 text-[#01454A] group-hover:translate-x-0.5 transition-transform duration-200">
                        Details <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Seller Details Inspector Drawer */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs transition-opacity duration-300">
          <div className="w-full max-w-md h-full bg-[#F8F5ED] p-6 md:p-8 overflow-y-auto shadow-2xl flex flex-col justify-between border-l border-[#ECE6D6] animate-in slide-in-from-right duration-300">
            {/* Drawer Body */}
            <div className="space-y-6">
              {/* Close row */}
              <div className="flex items-center justify-between">
                <span className="font-satoshi text-xs font-semibold uppercase tracking-widest text-[#5A6465]">
                  Boutique Inspector
                </span>
                <button
                  onClick={() => setSelectedVendorId(null)}
                  className="p-1 rounded-full border border-[#ECE6D6] bg-white hover:bg-black hover:text-white transition"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Cover Backdrop */}
              <div className="relative h-40 rounded-2xl overflow-hidden bg-gradient-to-tr from-[#01454A] to-[#FDA600]/30 border border-[#ECE6D6] flex items-center justify-center">
                {/* Logo Floating */}
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white bg-white shadow-md flex items-center justify-center text-[#01454A] font-bon_foyage text-3xl">
                  {selectedVendor.store_name?.[0]?.toUpperCase()}
                </div>
              </div>

              {/* Boutique legal detail */}
              <div className="space-y-2 pt-2">
                <h4 className="font-bon_foyage text-3xl text-black">
                  {selectedVendor.store_name}
                </h4>
                {selectedVendor.tagline && (
                  <p className="font-satoshi text-sm text-[#01454A] font-medium italic">
                    "{selectedVendor.tagline}"
                  </p>
                )}
              </div>

              {/* Status Pills */}
              <div className="flex flex-wrap gap-2">
                {selectedVendor.is_featured && (
                  <span className="flex items-center gap-1 bg-[#FDA600] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 fill-white" />
                    SPOTLIGHT BOUTIQUE
                  </span>
                )}
                {selectedVendor.is_verified && (
                  <span className="flex items-center gap-1 bg-[#01454A] text-[#F8F5ED] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FDA600]" />
                    VERIFIED CRAFT HOUSE
                  </span>
                )}
                {!selectedVendor.is_active && (
                  <span className="flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                    SUSPENDED
                  </span>
                )}
              </div>

              {/* Performance Metrics Panel */}
              <div className="bg-white border border-[#ECE6D6] rounded-2xl p-5 space-y-4">
                <p className="font-bon_foyage text-lg text-black border-b border-[#ECE6D6]/50 pb-2">
                  Performance Metrics
                </p>
                
                <div className="grid grid-cols-2 gap-4 text-sm font-satoshi">
                  <div className="bg-[#F8F5ED]/50 p-3 rounded-xl border border-[#ECE6D6]/40">
                    <span className="text-xs text-[#8A9596] block">Boutique Rating</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="font-bold text-black">{Number(selectedVendor.average_rating || 0).toFixed(1)}</span>
                      <div className="flex items-center">
                        {renderStars(selectedVendor.average_rating || 0)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#F8F5ED]/50 p-3 rounded-xl border border-[#ECE6D6]/40">
                    <span className="text-xs text-[#8A9596] block">Feedback Count</span>
                    <span className="font-bold text-black block mt-1">
                      {selectedVendor.review_count || 0} client logs
                    </span>
                  </div>

                  <div className="bg-[#F8F5ED]/50 p-3 rounded-xl border border-[#ECE6D6]/40">
                    <span className="text-xs text-[#8A9596] block">Active Catalog</span>
                    <span className="font-bold text-black block mt-1">
                      {selectedVendor.total_products || 0} unique items
                    </span>
                  </div>

                  <div className="bg-[#F8F5ED]/50 p-3 rounded-xl border border-[#ECE6D6]/40">
                    <span className="text-xs text-[#8A9596] block">Bespoke Orders</span>
                    <span className="font-bold text-emerald-600 block mt-1">
                      {selectedVendor.total_sales || 0} transactions
                    </span>
                  </div>
                </div>
              </div>

              {/* Commission Adjuster */}
              <div className="bg-white border border-[#ECE6D6] rounded-2xl p-5 space-y-3 font-satoshi text-sm">
                <span className="text-xs text-[#8A9596] block font-semibold uppercase">Platform Commission Rate</span>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A9596]" />
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(Number(e.target.value))}
                      className="w-full h-10 pl-9 pr-3 bg-[#F8F5ED]/50 border border-[#ECE6D6] focus:border-[#01454A] rounded-xl outline-none text-xs text-black"
                    />
                  </div>
                  <button
                    onClick={() => handleUpdateCommission(selectedVendor)}
                    disabled={updateCommissionMutation.isPending}
                    className="bg-[#01454A] hover:bg-[#01454A]/90 text-white font-bold text-xs h-10 px-4 rounded-xl flex items-center justify-center transition"
                  >
                    {updateCommissionMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update"}
                  </button>
                </div>
              </div>

              {/* Physical presence */}
              <div className="space-y-1.5 font-satoshi text-xs text-[#5A6465] px-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#FDA600]" />
                  <span className="font-medium text-black">
                    {[selectedVendor.city, selectedVendor.state, selectedVendor.country].filter(Boolean).join(", ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Action controls */}
            <div className="pt-6 border-t border-[#ECE6D6]/80 bg-inherit space-y-3">
              <span className="font-satoshi text-xs font-bold uppercase text-[#8A9596] tracking-wider block px-1">
                Aesthetics Operations
              </span>

              {/* Spotlight toggle */}
              <button
                onClick={() => handleToggleFeatured(selectedVendor)}
                disabled={toggleFeaturedMutation.isPending}
                className="w-full bg-white hover:bg-[#F4F3EC] border border-[#ECE6D6] text-black font-satoshi font-bold text-sm py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 transition duration-200"
              >
                {toggleFeaturedMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#FDA600] fill-[#FDA600]" />
                    {selectedVendor.is_featured ? "Remove Spotlight Star" : "Spotlight Spotlight Star"}
                  </>
                )}
              </button>

              {/* Approve / Reject buttons if not verified */}
              {!selectedVendor.is_verified && (
                <button
                  onClick={() => handleApprove(selectedVendor)}
                  disabled={approveVendorMutation.isPending}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-satoshi font-bold text-sm py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition duration-200"
                >
                  {approveVendorMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Approve Boutique Onboarding
                    </>
                  )}
                </button>
              )}

              {/* Suspend / Reactivate button */}
              <button
                onClick={() => handleToggleSuspend(selectedVendor)}
                disabled={suspendVendorMutation.isPending || reactivateVendorMutation.isPending}
                className={`w-full py-3.5 rounded-xl font-satoshi font-bold text-sm flex items-center justify-center gap-2 border shadow-sm transition-all duration-200 ${
                  selectedVendor.is_active
                    ? "bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                }`}
              >
                {suspendVendorMutation.isPending || reactivateVendorMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : selectedVendor.is_active ? (
                  <>
                    <Lock className="w-4 h-4" />
                    Suspend Storefront
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    Reactivate Storefront
                  </>
                )}
              </button>

              {/* Django Change page link */}
              <Link
                href={`${process.env.NEXT_PUBLIC_API_V1_URL || "http://127.0.0.1:8001"}/admin/vendor/vendorprofile/${selectedVendor.id}/change/`}
                target="_blank"
                className="w-full bg-white hover:bg-[#F4F3EC] border border-[#ECE6D6] text-black font-satoshi font-bold text-sm py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition duration-200"
              >
                <ExternalLink className="w-4 h-4 text-[#8A9596]" />
                Modify In Django Super-Admin
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
