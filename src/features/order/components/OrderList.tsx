/**
 * @file OrderList.tsx
 * @description Enterprise order list for admin dashboard.
 * Live TanStack Query data via useAdminOrders(),
 * row checkbox selection, bulk action support, paginated.
 */
"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, Package } from "lucide-react";
import { useAdminOrders } from "../hooks/use-order";
import type { OrderListItem, OrderStatus } from "../types/order.types";


// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_TABS: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending_payment" },
  { label: "Processing", value: "processing" },
  { label: "Delivered", value: "delivered" },
  { label: "Completed", value: "completed" },
  { label: "Returned", value: "refunded" },
];

const PAYMENT_BADGE: Record<string, string> = {
  paid: "bg-[#EDFAF3] text-[#25784A]",
  unpaid: "bg-[#FDFAE4] text-[#B8920D]",
  failed: "bg-red-50 text-red-600",
  refunded: "bg-slate-100 text-slate-500",
};

const SkeletonRow = () => (
  <tr className="border-b border-gray-100">
    {Array.from({ length: 8 }).map((_, i) => (
      <td key={i} className="py-4 px-2">
        <div className="shimmer h-4 rounded w-full" />
      </td>
    ))}
  </tr>
);

// ── Main component ─────────────────────────────────────────────────────────────

const OrderList = () => {
  const searchParams = useSearchParams();
  const activeStatus = searchParams.get("order-status") as OrderStatus | null;
  const currentPage = Number(searchParams.get("page") ?? 1);

  const { data, isLoading, isError } = useAdminOrders(currentPage);
  const orders: OrderListItem[] = data?.results ?? [];

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = activeStatus
    ? orders.filter((o) => o.status === activeStatus)
    : orders;

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((o) => o.id)));
    }
  };

  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length;

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex items-center gap-3 w-full md:w-[40%] h-12 md:h-[60px]
                      bg-white border border-[#d9d9d9] px-4 gap-4 rounded-lg shadow-sm">
        <Search size={18} className="text-gray-400 flex-shrink-0" />
        <input
          type="search"
          placeholder="Search order ID or customer…"
          className="w-full h-full bg-inherit outline-none text-sm placeholder:text-gray-400 text-black"
        />
      </div>

      {/* Status tabs */}
      <nav
        aria-label="Order filter"
        className="w-full lg:w-[65%] flex flex-wrap gap-2 items-center font-satoshi font-medium"
      >
        {STATUS_TABS.map(({ label, value }) => {
          const isActive = value === "" ? !activeStatus : activeStatus === value;
          return (
            <Link
              key={value}
              href={value ? `/admin-dashboard/orders?order-status=${value}` : "/admin-dashboard/orders"}
              className={`text-[10px] leading-none md:text-sm py-2 px-3 md:py-2.5 md:px-5
                          rounded-xl md:rounded-full whitespace-nowrap transition-all duration-150
                          ${isActive
                            ? "bg-[#FDA600] text-black shadow-sm"
                            : "bg-[#d9d9d9] text-[#9d9d9d] hover:bg-[#FDA600]/20 hover:text-black"
                          }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Table */}
      <div className="p-2.5 bg-white shadow-sm rounded-xl min-h-[200px] overflow-x-auto border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200 table-fixed text-black font-satoshi">
          <thead>
            <tr className="text-[8.5px] md:text-sm font-semibold text-gray-600 bg-[#f7f7f7]">
              <th className="pl-3 py-4 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all orders"
                  className="w-4 h-4 rounded border-gray-400 accent-[#FDA600]"
                />
              </th>
              <th className="py-3 px-2 text-center">Order #</th>
              <th className="py-3 px-2 text-center">Date</th>
              <th className="py-3 px-2 text-center">Customer</th>
              <th className="py-3 px-2 text-center">Items</th>
              <th className="py-3 px-2 text-center">Payment</th>
              <th className="py-3 px-2 text-center">Status</th>
              <th className="py-3 px-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              : isError
              ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-red-500 text-sm">
                    Failed to load orders. Refresh to try again.
                  </td>
                </tr>
              )
              : filtered.length === 0
              ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <Package size={40} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-400 text-sm">No orders found.</p>
                  </td>
                </tr>
              )
              : filtered.map((order) => (
                <tr
                  key={order.id}
                  className={`hover:bg-[#FFFBF0] transition-colors text-[9px] md:text-sm
                              ${selectedIds.has(order.id) ? "bg-amber-50" : ""}`}
                >
                  <td className="pl-3 py-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(order.id)}
                      onChange={() => toggleRow(order.id)}
                      aria-label={`Select order ${order.order_number}`}
                      className="w-4 h-4 rounded border-gray-400 accent-[#FDA600]"
                    />
                  </td>
                  <td className="py-4 px-2 text-center">
                    <Link
                      href={`/admin-dashboard/orders/${order.id}`}
                      className="font-medium text-[#01454A] hover:underline"
                    >
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="py-4 px-2 text-center text-gray-500 whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString("en-NG", {
                      day: "2-digit",
                      month: "short",
                      year: "2-digit",
                    })}
                  </td>
                  <td className="py-4 px-2 text-center">
                    {order.requires_measurement && (
                      <span className="mr-1 text-[#FDA600]" title="Requires measurement">📏</span>
                    )}
                    —
                  </td>
                  <td className="py-4 px-2 text-center">{order.item_count}</td>
                  <td className="py-4 px-2 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] md:text-xs font-medium whitespace-nowrap
                                  ${PAYMENT_BADGE[order.payment_status] ?? "bg-gray-100 text-gray-500"}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-center capitalize font-medium text-gray-700">
                    {order.status.replace(/_/g, " ")}
                  </td>
                  <td className="py-4 px-2 text-center">
                    <Link
                      href={`/admin-dashboard/orders/${order.id}`}
                      className="text-[#01454A] text-xs font-medium hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
                        flex items-center gap-4 bg-white shadow-xl border border-gray-200
                        rounded-full px-6 py-3 text-sm font-medium">
          <span className="text-gray-600">{selectedIds.size} selected</span>
          <button className="text-red-500 hover:text-red-700 transition-colors">
            Cancel selected
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderList;
