/**
 * @file CartList.tsx
 * @description Enterprise cart auditing and activity directory for administrators.
 * Live TanStack Query data via useAdminCarts(), nuqs URL query sync, and clear-cart mutations.
 */
"use client";

import { useState, useTransition, useEffect } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { Search, ShoppingBag, Trash2, Clock, Mail, Tag, Eye } from "lucide-react";
import { useAdminCarts, useClearAdminCart, useAdminCartDetail } from "../hooks";
import type { AdminCart, AdminCartItem } from "../types";



const SkeletonRow = () => (
  <tr className="border-b border-gray-100 animate-pulse">
    {Array.from({ length: 6 }).map((_, i) => (
      <td key={i} className="py-4 px-4">
        <div className="h-4 bg-gray-150 rounded w-5/6 mx-auto" />
      </td>
    ))}
  </tr>
);

export function CartList() {
  const [, startTransition] = useTransition();

  // Nuqs URL state synchronization
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const [pageParam, setPageParam] = useQueryState("page", parseAsInteger.withDefault(1));

  // Local state for debounced input
  const [searchInput, setSearchInput] = useState(search);
  const [selectedCartId, setSelectedCartId] = useState<string | null>(null);

  // Simple debounce logic for search
  useEffect(() => {
    const handler = setTimeout(() => {
      startTransition(() => {
        void setSearch(searchInput || null);
        void setPageParam(1); // Reset page to 1 on search
      });
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // Sync local input with URL parameter updates
  useEffect(() => {
    if (search !== searchInput) {
      setSearchInput(search);
    }
  }, [search]);

  // Query Hook
  const { data, isLoading, isError } = useAdminCarts(pageParam, search || undefined);
  const carts = data?.results || [];
  const totalCount = data?.count || 0;
  const limit = 100;
  const totalPages = Math.ceil(totalCount / limit);

  // Clear Cart mutation
  const { mutate: clearCart, isPending: clearing } = useClearAdminCart();

  // Selected cart detail query
  const { data: activeCartDetail, isLoading: loadingDetail } = useAdminCartDetail(
    selectedCartId || "",
    !!selectedCartId
  );

  function handleClear(cartId: string, emailOrSession: string) {
    if (
      confirm(
        `Are you sure you want to FORCE clear the cart for ${emailOrSession}? This will permanently remove all items from their active session.`
      )
    ) {
      clearCart(cartId);
      if (selectedCartId === cartId) {
        setSelectedCartId(null);
      }
    }
  }

  // Calculate live KPI statistics from listed items
  const totalActiveValue = carts.reduce((acc: number, c: AdminCart) => acc + parseFloat(c.total || "0"), 0);
  const anonymousCartsCount = carts.filter((c: AdminCart) => !c.owner_email).length;
  const averageValue = totalCount > 0 ? totalActiveValue / totalCount : 0;

  function formatNGN(amount: string | number | null | undefined): string {
    const n = typeof amount === "string" ? parseFloat(amount) : (amount ?? 0);
    return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return (
    <div className="space-y-6">
      {/* ── KPI Widgets ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Active Carts */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm hover:border-[#01454A]/30 transition duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 font-satoshi">
              Active Shopping Carts
            </span>
            <div className="p-2 bg-[#01454A]/5 rounded-xl">
              <ShoppingBag className="h-5 w-5 text-[#01454A]" />
            </div>
          </div>
          <h3 className="text-2xl font-bold font-satoshi text-black">{totalCount}</h3>
          <p className="text-[11px] text-gray-400 mt-1 font-satoshi">Active customer & guest sessions</p>
        </div>

        {/* Total Active Pipeline Value */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm hover:border-[#01454A]/30 transition duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 font-satoshi">
              Pipeline Cart Value
            </span>
            <div className="p-2 bg-[#FDA600]/10 rounded-xl">
              <Tag className="h-5 w-5 text-[#FDA600]" />
            </div>
          </div>
          <h3 className="text-2xl font-bold font-satoshi text-black">{formatNGN(totalActiveValue)}</h3>
          <p className="text-[11px] text-gray-400 mt-1 font-satoshi">Cumulative potential revenue</p>
        </div>

        {/* Guest Sessions */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm hover:border-[#01454A]/30 transition duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 font-satoshi">
              Guest/Anonymous Carts
            </span>
            <div className="p-2 bg-purple-50 rounded-xl">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold font-satoshi text-black">{anonymousCartsCount}</h3>
          <p className="text-[11px] text-gray-400 mt-1 font-satoshi">Carts without user accounts</p>
        </div>

        {/* Average Value */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm hover:border-[#01454A]/30 transition duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 font-satoshi">
              Average Cart Value
            </span>
            <div className="p-2 bg-emerald-50 rounded-xl">
              <Tag className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold font-satoshi text-black">{formatNGN(averageValue)}</h3>
          <p className="text-[11px] text-gray-400 mt-1 font-satoshi">Potential average order value</p>
        </div>
      </div>

      {/* ── Filters & Search ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer email or session ID..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#01454A] placeholder:text-gray-400 text-black font-satoshi"
          />
        </div>
      </div>

      {/* ── Main Layout (Grid) ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Carts Table */}
        <div className="lg:col-span-2 bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-400 font-satoshi">
                  <th className="py-3 px-4 font-semibold">User Identifiers</th>
                  <th className="py-3 px-4 font-semibold text-center">Items Qty</th>
                  <th className="py-3 px-4 font-semibold text-right">Subtotal</th>
                  <th className="py-3 px-4 font-semibold text-right">Total</th>
                  <th className="py-3 px-4 font-semibold">Last Active</th>
                  <th className="py-3 px-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium text-gray-700 divide-y divide-gray-100 font-satoshi">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : isError ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-red-500 font-semibold">
                      Could not load shopping carts. Please try again later.
                    </td>
                  </tr>
                ) : carts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      No active shopping carts found matching criteria.
                    </td>
                  </tr>
                ) : (
                  carts.map((cart: AdminCart) => {
                    const identifier = cart.owner_email || `Guest: ${cart.session_key?.slice(0, 12)}...`;
                    const hasUser = !!cart.owner_email;
                    return (
                      <tr
                        key={cart.id}
                        className={`hover:bg-gray-50 transition cursor-pointer ${
                          selectedCartId === cart.id ? "bg-[#01454A]/5 hover:bg-[#01454A]/8" : ""
                        }`}
                        onClick={() => setSelectedCartId(cart.id)}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            {hasUser ? (
                              <Mail className="h-4 w-4 text-[#01454A]" />
                            ) : (
                              <Clock className="h-4 w-4 text-gray-400" />
                            )}
                            <span className="font-semibold text-black truncate max-w-[180px]">
                              {identifier}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold text-black">
                          {cart.items?.reduce((sum: number, item: AdminCartItem) => sum + item.quantity, 0) || 0}
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-gray-500">
                          {formatNGN(cart.subtotal)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-black">
                          {formatNGN(cart.total)}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-gray-400">
                          {new Date(cart.last_activity).toLocaleDateString("en-NG", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedCartId(cart.id)}
                              className="p-1.5 text-gray-500 hover:text-[#01454A] bg-gray-50 hover:bg-[#01454A]/5 rounded-lg transition"
                              title="Inspect Cart Detail"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleClear(cart.id, identifier)}
                              className="p-1.5 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition"
                              title="Clear Cart"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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

          {/* Pagination controls */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 p-4 font-satoshi">
              <p className="text-xs font-semibold text-gray-400">
                Showing page <span className="font-bold text-black">{pageParam}</span> of{" "}
                <span className="font-bold text-black">{totalPages}</span> ({totalCount} total carts)
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pageParam <= 1}
                  onClick={() => void setPageParam((p) => Math.max(1, p - 1))}
                  className="px-3.5 py-1.5 text-xs font-bold border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-black"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={pageParam >= totalPages}
                  onClick={() => void setPageParam((p) => Math.min(totalPages, p + 1))}
                  className="px-3.5 py-1.5 text-xs font-bold border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-black"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Detailed Inspection Panel */}
        <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold text-black font-satoshi text-base">Cart Inspection Desk</h3>
            {selectedCartId && (
              <button
                type="button"
                onClick={() => setSelectedCartId(null)}
                className="text-xs font-bold text-[#01454A] hover:opacity-75 font-satoshi"
              >
                Close
              </button>
            )}
          </div>

          {!selectedCartId ? (
            <div className="text-center py-12 text-gray-400 font-satoshi space-y-2">
              <ShoppingBag className="mx-auto h-8 w-8 text-gray-300" />
              <p className="text-xs font-semibold">Select a cart from the directory to inspect items and user session details.</p>
            </div>
          ) : loadingDetail ? (
            <div className="space-y-3 py-6 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="h-3 bg-gray-100 rounded w-5/6" />
              <div className="h-12 bg-gray-100 rounded-xl" />
            </div>
          ) : !activeCartDetail ? (
            <div className="text-center py-6 text-red-500 font-semibold text-xs font-satoshi">
              Failed to load cart detail.
            </div>
          ) : (
            <div className="space-y-4 font-satoshi">
              {/* Session / Owner details */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Cart Identification</span>
                <p className="text-xs font-bold text-black break-all">ID: {activeCartDetail.id}</p>
                {activeCartDetail.owner_email ? (
                  <p className="text-xs font-medium text-[#01454A] flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> User: {activeCartDetail.owner_email}
                  </p>
                ) : (
                  <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> Guest Session: {activeCartDetail.session_key}
                  </p>
                )}
              </div>

              {/* Coupon Info */}
              {activeCartDetail.coupon_code && (
                <div className="bg-[#EDFAF3] border border-[#25784A]/10 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#25784A] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Tag className="h-4 w-4" /> Code: {activeCartDetail.coupon_code}
                  </span>
                  <span>-{formatNGN(activeCartDetail.coupon_discount)}</span>
                </div>
              )}

              {/* Item snapshot list */}
              <div className="border-t border-b border-gray-100 py-3 space-y-2.5 max-h-[240px] overflow-y-auto">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Cart Contents</span>
                {activeCartDetail.items?.length === 0 ? (
                  <p className="text-xs text-gray-400 py-2">No items inside this cart session.</p>
                ) : (
                  activeCartDetail.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start text-xs gap-3">
                      <div>
                        <p className="font-bold text-black leading-snug">{item.product_title}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Qty: {item.quantity} · {item.variant_name || "Standard"}
                        </p>
                      </div>
                      <span className="font-semibold text-black shrink-0">{formatNGN(item.line_total)}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Financial metrics summary */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>{formatNGN(activeCartDetail.subtotal)}</span>
                </div>
                {parseFloat(activeCartDetail.coupon_discount) > 0 && (
                  <div className="flex justify-between text-[#25784A]">
                    <span>Discount</span>
                    <span>-{formatNGN(activeCartDetail.coupon_discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-black font-bold text-sm border-t border-dashed border-gray-100 pt-2">
                  <span>Grand Total</span>
                  <span>{formatNGN(activeCartDetail.total)}</span>
                </div>
              </div>

              {/* Clear Cart Button */}
              <button
                type="button"
                disabled={clearing}
                onClick={() =>
                  handleClear(
                    activeCartDetail.id,
                    activeCartDetail.owner_email || `Guest Session: ${activeCartDetail.session_key?.slice(0, 8)}`
                  )
                }
                className="w-full flex items-center justify-center gap-2 bg-red-650 hover:bg-red-700 text-white font-bold text-xs py-2.5 rounded-xl transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Trash2 className="h-4 w-4" /> Force Clear Active Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
