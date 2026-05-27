/**
 * @file OrderList.tsx
 * @description Enterprise order list for admin dashboard.
 * Live TanStack Query data via useAdminOrders(),
 * row checkbox selection, bulk action support, paginated.
 */
"use client";
import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Package, ArrowLeft, ArrowRight } from "lucide-react";
import { useAdminOrders } from "../hooks/use-order";
import type { OrderListItem } from "../types/order.types";


// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_TABS: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "Pending Payment", value: "pending_payment" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Completed", value: "completed" },
  { label: "Refunded", value: "refunded" },
];

const PAYMENT_BADGE: Record<string, string> = {
  paid: "bg-[#EDFAF3] text-[#25784A]",
  unpaid: "bg-[#FDFAE4] text-[#B8920D]",
  failed: "bg-red-50 text-red-600",
  refunded: "bg-slate-100 text-slate-500",
};

const SkeletonRow = () => (
  <tr className="border-b border-gray-100 animate-pulse">
    <td className="pl-3 py-4 w-10">
      <div className="h-4 w-4 bg-gray-200 rounded" />
    </td>
    {Array.from({ length: 7 }).map((_, i) => (
      <td key={i} className="py-4 px-2">
        <div className="h-4 bg-gray-150 rounded w-2/3 mx-auto" />
      </td>
    ))}
  </tr>
);

export const OrderList = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Read query parameters
  const activeStatus = searchParams.get("order-status") || "";
  const pageParam = Number(searchParams.get("page") || "1");
  const [searchInput, setSearchTerm] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchInput);

  // Simple debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      // Reset page to 1 when search term changes
      const params = new URLSearchParams(searchParams.toString());
      if (searchInput) {
        params.set("search", searchInput);
      } else {
        params.delete("search");
      }
      params.set("page", "1");
      startTransition(() => {
        router.push(`/admin-dashboard/orders?${params.toString()}`);
      });
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // Sync state with URL parameter if it changes externally
  useEffect(() => {
    const searchFromUrl = searchParams.get("search") || "";
    if (searchFromUrl !== searchInput) {
      setSearchTerm(searchFromUrl);
    }
  }, [searchParams]);

  // Query Hook
  const { data, isLoading, isError } = useAdminOrders(pageParam, debouncedSearch || undefined, activeStatus || undefined);
  const orders = data?.results || [];
  const totalCount = data?.count || 0;
  const limit = 100;
  const totalPages = Math.ceil(totalCount / limit);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Reset selected IDs when orders change
  useEffect(() => {
    setSelectedIds(new Set());
  }, [orders]);

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === orders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(orders.map((o) => o.id)));
    }
  };

  const allSelected = orders.length > 0 && selectedIds.size === orders.length;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    startTransition(() => {
      router.push(`/admin-dashboard/orders?${params.toString()}`);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header section with live KPI summary snippet */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#01454A]">Orders Management</h1>
          <p className="text-sm text-gray-500">View, update, and manage FASHIONISTAR client orders globally.</p>
        </div>
        <div className="bg-[#EDFAF3] border border-[#25784A]/20 px-4 py-2.5 rounded-lg flex items-center gap-2 text-xs font-semibold text-[#25784A]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#25784A] animate-pulse" />
          <span>Live Order Flow Synced ({totalCount} total)</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="flex items-center gap-3 w-full md:w-[40%] h-12 bg-white border border-gray-200 px-4 rounded-lg shadow-sm focus-within:border-[#01454A] focus-within:ring-2 focus-within:ring-[#01454A]/20 transition-all">
          <Search size={18} className="text-gray-400 flex-shrink-0" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search order ID or customer details..."
            className="w-full h-full bg-inherit outline-none text-sm placeholder:text-gray-400 text-black font-satoshi"
          />
        </div>

        {/* Status tabs */}
        <nav
          aria-label="Order status filter"
          className="flex flex-wrap gap-2 items-center font-satoshi font-medium overflow-x-auto py-1"
        >
          {STATUS_TABS.map(({ label, value }) => {
            const isActive = value === activeStatus;
            const linkHref = value ? `/admin-dashboard/orders?order-status=${value}` : "/admin-dashboard/orders";
            return (
              <Link
                key={value}
                href={linkHref}
                className={`text-[11px] md:text-xs py-2 px-3.5 rounded-full whitespace-nowrap transition-all duration-150 font-semibold border
                            ${isActive
                              ? "bg-[#01454A] text-white border-[#01454A] shadow-md"
                              : "bg-[#F4F3EC] text-[#555] border-gray-200 hover:border-[#01454A] hover:bg-white"
                            }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Table */}
      <div className="p-2 bg-white shadow-md rounded-xl min-h-[250px] overflow-x-auto border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200 table-fixed text-black font-satoshi">
          <thead>
            <tr className="text-xs font-semibold text-gray-700 bg-gray-50/70">
              <th className="pl-3 py-4 w-12 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all orders"
                  className="w-4 h-4 rounded border-gray-400 accent-[#01454A]"
                />
              </th>
              <th className="py-4 px-2 text-center font-bold">Order #</th>
              <th className="py-4 px-2 text-center">Date</th>
              <th className="py-4 px-2 text-center">Payment Status</th>
              <th className="py-4 px-2 text-center">Escrow</th>
              <th className="py-4 px-2 text-center">Outstanding</th>
              <th className="py-4 px-2 text-center">Status</th>
              <th className="py-4 px-2 text-center">Total</th>
              <th className="py-4 px-2 text-center w-24">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
            ) : isError ? (
              <tr>
                <td colSpan={9} className="py-16 text-center text-red-500 text-sm font-semibold">
                  Failed to load orders. Refresh to try again.
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-20 text-center">
                  <Package size={44} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-400 text-sm">No orders matching criteria found.</p>
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const isSelected = selectedIds.has(order.id);
                return (
                  <tr
                    key={order.id}
                    className={`hover:bg-[#FFFBF0]/60 transition-colors text-xs md:text-sm
                                ${isSelected ? "bg-amber-50/40" : ""}`}
                  >
                    <td className="pl-3 py-4 w-12">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRow(order.id)}
                        aria-label={`Select order ${order.order_number}`}
                        className="w-4 h-4 rounded border-gray-400 accent-[#01454A]"
                      />
                    </td>
                    <td className="py-4 px-2 text-center font-bold text-[#01454A]">
                      <Link
                        href={`/admin-dashboard/orders/${order.id}`}
                        className="hover:underline"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="py-4 px-2 text-center text-gray-500 whitespace-nowrap text-xs">
                      {new Date(order.created_at).toLocaleDateString("en-NG", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-4 px-2 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] md:text-xs font-semibold whitespace-nowrap capitalize
                                    ${PAYMENT_BADGE[order.payment_status] ?? "bg-gray-100 text-gray-500"}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-center font-semibold text-xs">
                      <span className={`px-2 py-0.5 rounded capitalize
                        ${order.escrow_status === "released" ? "bg-green-100 text-green-800" :
                          order.escrow_status === "refunded" ? "bg-blue-100 text-blue-800" :
                          "bg-amber-100 text-amber-800"}`}
                      >
                        {order.escrow_status}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-center text-xs font-medium text-gray-600">
                      {parseFloat(order.amount_outstanding) > 0 ? (
                        <span className="text-amber-700 font-bold">
                          ₦{parseFloat(order.amount_outstanding).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-green-700 font-semibold">Fully Paid</span>
                      )}
                    </td>
                    <td className="py-4 px-2 text-center capitalize font-semibold text-xs">
                      <span className={`px-2 py-1 rounded-full text-[10px]
                        ${order.status === "completed" ? "bg-green-50 text-green-700 border border-green-200" :
                          order.status === "cancelled" ? "bg-red-50 text-red-700 border border-red-200" :
                          order.status === "shipped" ? "bg-purple-50 text-purple-700 border border-purple-200" :
                          "bg-blue-50 text-blue-700 border border-blue-200"}`}
                      >
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-center font-bold text-gray-900">
                      ₦{parseFloat(order.final_total).toLocaleString()}
                    </td>
                    <td className="py-4 px-2 text-center">
                      <Link
                        href={`/admin-dashboard/orders/${order.id}`}
                        className="bg-[#01454A] hover:bg-[#026269] text-white text-[11px] px-3 py-1.5 rounded font-semibold shadow-sm transition-all"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-150 pt-4 px-2">
          <span className="text-xs text-gray-500 font-medium">
            Showing Page <strong className="text-gray-700">{pageParam}</strong> of{" "}
            <strong className="text-gray-700">{totalPages}</strong> ({totalCount} items)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pageParam - 1)}
              disabled={pageParam <= 1}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-inherit transition-all"
              aria-label="Previous Page"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={() => handlePageChange(pageParam + 1)}
              disabled={pageParam >= totalPages}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-inherit transition-all"
              aria-label="Next Page"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
                        flex items-center gap-4 bg-white shadow-xl border border-gray-200
                        rounded-full px-6 py-3 text-sm font-medium animate-bounce-subtle">
          <span className="text-gray-600 font-semibold">{selectedIds.size} selected</span>
          <button className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors px-4 py-1.5 rounded-full text-xs font-bold border border-red-200">
            Cancel Selected
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderList;
