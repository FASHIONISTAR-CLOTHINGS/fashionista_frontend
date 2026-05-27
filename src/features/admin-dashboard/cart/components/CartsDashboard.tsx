/**
 * @file CartsDashboard.tsx
 * @description Premium cart administration dashboard.
 * Live data via useAdminCarts(), Nuqs URL state sync, detail drawers, clear actions.
 */
"use client";

import { useState, useTransition, useEffect } from "react";
import { useQueryState } from "nuqs";
import { Search, ShoppingCart, Trash2, XCircle, Clock } from "lucide-react";
import { useAdminCarts, useAdminCartDetail, useClearAdminCart } from "../hooks";
import type { AdminCart } from "../types";

// Helper to format currency if helper doesn't exist
function formatCurrency(amount: string | number | null | undefined): string {
  const n = typeof amount === "string" ? parseFloat(amount) : (amount ?? 0);
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function CartsDashboard() {
  const [, startTransition] = useTransition();

  // Nuqs URL state sync
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const [selectedCartId, setSelectedCartId] = useState<string | null>(null);

  // Local state for debounced search input
  const [searchInput, setSearchInput] = useState(search);

  // Simple debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      startTransition(() => {
        void setSearch(searchInput || null);
      });
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Sync input with external URL param updates
  useEffect(() => {
    if (search !== searchInput) {
      setSearchInput(search);
    }
  }, [search]);

  // Queries & Mutations
  const { data: cartsData, isLoading, isError } = useAdminCarts(1, search || undefined);
  const carts = cartsData?.results ?? [];
  const { data: cartDetail, isLoading: isLoadingDetail } = useAdminCartDetail(
    selectedCartId ?? "",
    !!selectedCartId
  );
  const clearMutation = useClearAdminCart();

  const handleClearCart = (id: string) => {
    if (confirm("Are you sure you want to manually void/clear this shopping cart?")) {
      clearMutation.mutate(id, {
        onSuccess: () => {
          if (selectedCartId === id) {
            setSelectedCartId(null);
          }
        },
      });
    }
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#01454A]">Active Cart Monitoring</h1>
          <p className="text-sm text-gray-500">Monitor active user and guest shopping sessions globally.</p>
        </div>
        <div className="bg-[#EDFAF3] border border-[#25784A]/20 px-4 py-2.5 rounded-lg flex items-center gap-2 text-xs font-semibold text-[#25784A]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#25784A] animate-pulse" />
          <span>Live Session Sync ({carts.length} active)</span>
        </div>
      </div>

      {/* Search Filter bar */}
      <div className="flex items-center gap-3 w-full md:w-[40%] h-12 bg-white border border-gray-200 px-4 rounded-lg shadow-sm focus-within:border-[#01454A] focus-within:ring-2 focus-within:ring-[#01454A]/20 transition-all">
        <Search size={18} className="text-gray-400 flex-shrink-0" />
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by owner email or session key..."
          className="w-full h-full bg-inherit outline-none text-sm placeholder:text-gray-400 text-black font-satoshi"
        />
      </div>

      {/* Main workplace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Table List */}
        <div className="xl:col-span-8 p-2 bg-white shadow-md rounded-xl min-h-[300px] overflow-x-auto border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200 table-fixed text-black font-satoshi">
            <thead>
              <tr className="text-xs font-semibold text-gray-700 bg-gray-50/70">
                <th className="py-4 px-3 text-left">Owner / Session</th>
                <th className="py-4 px-3 text-center">Items</th>
                <th className="py-4 px-3 text-center">Subtotal</th>
                <th className="py-4 px-3 text-center">Total</th>
                <th className="py-4 px-3 text-center">Last Active</th>
                <th className="py-4 px-3 text-center w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs md:text-sm">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-gray-100 animate-pulse">
                    <td colSpan={6} className="py-4 px-3">
                      <div className="h-4 bg-gray-150 rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-red-500 font-semibold">
                    Failed to retrieve active carts. Please try again.
                  </td>
                </tr>
              ) : carts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <ShoppingCart size={40} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-400 text-sm">No active shopping carts found.</p>
                  </td>
                </tr>
              ) : (
                carts.map((cart: AdminCart) => {
                  const isSelected = cart.id === selectedCartId;
                  const displayName = cart.owner_email || `Guest (${cart.session_key?.slice(0, 8)}...)`;
                  return (
                    <tr
                      key={cart.id}
                      className={`hover:bg-[#FFFBF0]/60 transition-colors cursor-pointer ${
                        isSelected ? "bg-amber-50/40" : ""
                      }`}
                      onClick={() => setSelectedCartId(cart.id)}
                    >
                      <td className="py-4 px-3 text-left font-semibold text-[#01454A] truncate max-w-[200px]">
                        {displayName}
                      </td>
                      <td className="py-4 px-3 text-center font-bold">
                        {cart.items.length}
                      </td>
                      <td className="py-4 px-3 text-center">
                        {formatCurrency(cart.subtotal)}
                      </td>
                      <td className="py-4 px-3 text-center font-bold text-gray-900">
                        {formatCurrency(cart.total)}
                      </td>
                      <td className="py-4 px-3 text-center text-gray-500 whitespace-nowrap text-xs">
                        {formatDate(cart.last_activity)}
                      </td>
                      <td className="py-4 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedCartId(cart.id)}
                            className="bg-[#01454A] hover:bg-[#026269] text-white text-[11px] px-2.5 py-1.5 rounded font-semibold shadow-sm transition-all"
                          >
                            Inspect
                          </button>
                          <button
                            type="button"
                            onClick={() => handleClearCart(cart.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-650 text-[11px] px-2.5 py-1.5 rounded font-bold border border-red-200 transition-all flex items-center gap-1"
                          >
                            <Trash2 size={12} /> Clear
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Right workspace: Detailed Inspection */}
        <div className="xl:col-span-4 bg-[#F8F5ED]/40 border border-[#ECE6D6] rounded-[24px] p-5 min-h-[300px] flex flex-col justify-start">
          {!selectedCartId ? (
            <div className="m-auto text-center py-10 space-y-3">
              <div className="w-12 h-12 bg-[#01454A]/5 border border-[#01454A]/10 rounded-xl text-[#01454A] flex items-center justify-center mx-auto">
                <ShoppingCart size={22} />
              </div>
              <h4 className="font-bon_foyage text-xl text-black">Workspace Inspector</h4>
              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                Select an active shopping session from the table list to load and inspect cart items, applied coupons, and active items list.
              </p>
            </div>
          ) : isLoadingDetail ? (
            <div className="m-auto text-center py-10 space-y-2">
              <Clock className="w-8 h-8 text-[#01454A] animate-spin mx-auto" />
              <p className="text-xs text-gray-500">Retrieving cart details...</p>
            </div>
          ) : cartDetail ? (
            <div className="space-y-5 flex-1 flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#ECE6D6]/80 pb-3">
                  <div>
                    <span className="font-mono text-[10px] text-gray-400 block">ID: {cartDetail.id}</span>
                    <h4 className="font-bon_foyage text-lg text-black mt-0.5 truncate max-w-[220px]">
                      {cartDetail.owner_email || "Guest Session"}
                    </h4>
                  </div>
                  <button
                    onClick={() => setSelectedCartId(null)}
                    className="p-1 rounded-full border border-[#ECE6D6] bg-white hover:bg-black hover:text-white transition"
                  >
                    <XCircle size={16} />
                  </button>
                </div>

                {/* Session Keys */}
                <div className="space-y-2 text-xs font-satoshi bg-white p-3.5 rounded-xl border border-[#ECE6D6]">
                  {cartDetail.session_key && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#8A9596]">Session Key:</span>
                      <span className="font-mono text-black font-semibold truncate max-w-[150px]">{cartDetail.session_key}</span>
                    </div>
                  )}
                  {cartDetail.coupon_code && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#8A9596]">Coupon Applied:</span>
                      <span className="font-bold text-emerald-650 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        {cartDetail.coupon_code} (-{formatCurrency(cartDetail.coupon_discount)})
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-[#8A9596]">Last Activity:</span>
                    <span className="text-gray-500 font-semibold">{formatDate(cartDetail.last_activity)}</span>
                  </div>
                </div>

                {/* Cart Items List */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                    Shopping Cart Items ({cartDetail.items.length})
                  </span>
                  <div className="max-h-[250px] overflow-y-auto space-y-2 divide-y divide-[#ECE6D6]/30">
                    {cartDetail.items.length === 0 ? (
                      <p className="text-xs text-gray-400 italic py-4 text-center">Cart is currently empty.</p>
                    ) : (
                      cartDetail.items.map((item) => (
                        <div key={item.id} className="pt-2 first:pt-0 flex items-start justify-between gap-3 text-xs">
                          <div>
                            <p className="font-semibold text-black leading-tight">{item.product_title}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">
                              Qty: {item.quantity} · Price: {formatCurrency(item.unit_price)}
                              {item.variant_name ? ` · ${item.variant_name}` : ""}
                            </p>
                          </div>
                          <span className="font-bold text-gray-900 shrink-0">{formatCurrency(item.line_total)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Total Card */}
              <div className="pt-4 border-t border-[#ECE6D6]/80 bg-inherit space-y-3 mt-auto">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Subtotal:</span>
                  <span className="font-semibold text-black">{formatCurrency(cartDetail.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-gray-900">Total Price:</span>
                  <span className="font-extrabold text-[#01454A] text-base">{formatCurrency(cartDetail.total)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleClearCart(cartDetail.id)}
                  disabled={clearMutation.isPending}
                  className="w-full h-11 bg-red-650 hover:bg-red-700 disabled:opacity-45 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition duration-200"
                >
                  <Trash2 size={14} /> Clear Cart Session
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
