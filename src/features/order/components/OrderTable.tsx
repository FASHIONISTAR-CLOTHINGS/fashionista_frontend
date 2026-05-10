/**
 * @file OrderTable.tsx
 * @description Enterprise order table for vendor dashboard.
 * Live TanStack Query data via useVendorOrders(),
 * URL-state filter with nuqs, Suspense-safe, paginated.
 */
"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, Package } from "lucide-react";
import { useVendorOrders } from "../hooks/use-order";
import type { OrderListItem, OrderStatus } from "../types/order.types";


// ── Status styling helpers ─────────────────────────────────────────────────────

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700",
  unpaid: "bg-yellow-50 text-yellow-700",
  failed: "bg-red-50 text-red-600",
  refunded: "bg-slate-100 text-slate-600",
};

const ORDER_STATUS_STYLES: Record<string, string> = {
  pending_payment: "text-yellow-600",
  payment_confirmed: "text-blue-600",
  processing: "text-indigo-600",
  shipped: "text-purple-600",
  out_for_delivery: "text-purple-600",
  delivered: "text-emerald-600",
  completed: "text-emerald-700",
  cancelled: "text-red-500",
  refund_requested: "text-orange-600",
  refunded: "text-slate-500",
  disputed: "text-orange-600",
};

const ORDER_STATUS_TABS: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending_payment" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Completed", value: "completed" },
  { label: "Returned", value: "refunded" },
];

// ── Skeleton row ───────────────────────────────────────────────────────────────

const SkeletonRow = () => (
  <tr className="border-b border-gray-100">
    {Array.from({ length: 7 }).map((_, i) => (
      <td key={i} className="py-4 px-2">
        <div className="shimmer h-4 rounded w-full" />
      </td>
    ))}
  </tr>
);

// ── Main component ─────────────────────────────────────────────────────────────

const OrderTable = () => {
  const searchParams = useSearchParams();
  const activeStatus = searchParams.get("order-status") as OrderStatus | null;
  const currentPage = Number(searchParams.get("page") ?? 1);

  const { data, isLoading, isError } = useVendorOrders(currentPage);
  const orders: OrderListItem[] = data?.results ?? [];

  // Client-side filter by status tab
  const filtered = activeStatus
    ? orders.filter((o) => o.status === activeStatus)
    : orders;

  return (
    <div className="flex flex-col gap-8 px-4 md:px-8 lg:px-10">
      {/* Search bar */}
      <div className="flex items-center gap-3 w-full md:w-1/2 lg:w-1/3 h-11 bg-white border border-[#d9d9d9] px-4 rounded-lg shadow-sm">
        <Search size={16} className="text-gray-400 flex-shrink-0" />
        <input
          type="search"
          placeholder="Search order number or ID…"
          className="w-full h-full bg-inherit outline-none text-sm text-black placeholder:text-gray-400"
        />
      </div>

      {/* Status tabs */}
      <nav
        aria-label="Order status filter"
        className="flex flex-wrap gap-2 items-center font-satoshi font-medium"
      >
        {ORDER_STATUS_TABS.map(({ label, value }) => {
          const isActive = value === "" ? !activeStatus : activeStatus === value;
          return (
            <Link
              key={value}
              href={value ? `/vendor/orders?order-status=${value}` : "/vendor/orders"}
              className={`text-[11px] leading-none md:text-sm py-2 px-3.5 md:py-2.5 md:px-5
                          rounded-full transition-all duration-150 whitespace-nowrap
                          ${isActive
                            ? "bg-[#FDA600] text-black shadow-sm"
                            : "bg-[#EEEEEE] text-[#6B6B6B] hover:bg-[#FDA600]/20 hover:text-black"
                          }`}
            >
              {label}
              {value === "" && data?.count !== undefined && (
                <span className="ml-1 text-[10px] opacity-70">({data.count})</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm border border-gray-100">
        <table className="min-w-full divide-y divide-gray-100 text-black font-satoshi">
          <thead>
            <tr className="bg-[#F7F7F7] text-xs md:text-sm font-semibold text-gray-600">
              <th className="py-3 px-3 text-center">Order #</th>
              <th className="py-3 px-3 text-center">Date</th>
              <th className="py-3 px-3 text-center">Items</th>
              <th className="py-3 px-3 text-center">Amount</th>
              <th className="py-3 px-3 text-center">Payment</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : isError
              ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-red-500 text-sm">
                    Failed to load orders. Please refresh.
                  </td>
                </tr>
              )
              : filtered.length === 0
              ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Package size={40} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-400 text-sm">No orders found.</p>
                  </td>
                </tr>
              )
              : filtered.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-[#FFFBF0] transition-colors text-xs md:text-sm text-black"
                >
                  <td className="py-4 px-3 text-center">
                    <Link
                      href={`/vendor/orders/${order.id}`}
                      className="font-medium text-[#01454A] hover:underline"
                    >
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="py-4 px-3 text-center text-gray-500 whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString("en-NG", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-4 px-3 text-center">{order.item_count}</td>
                  <td className="py-4 px-3 text-center font-medium whitespace-nowrap">
                    ₦{Number(order.final_total).toLocaleString("en-NG")}
                  </td>
                  <td className="py-4 px-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] md:text-xs font-medium whitespace-nowrap
                                  ${PAYMENT_STATUS_STYLES[order.payment_status] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                      {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    </span>
                  </td>
                  <td className={`py-4 px-3 text-center font-medium capitalize ${ORDER_STATUS_STYLES[order.status] ?? ""}`}>
                    {order.status.replace(/_/g, " ")}
                  </td>
                  <td className="py-4 px-3 text-center">
                    <Link
                      href={`/vendor/orders/${order.id}`}
                      className="text-[#01454A] hover:text-[#FDA600] text-xs font-medium underline-offset-2 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && (data.next || data.previous) && (
        <div className="flex items-center justify-between pt-2">
          <Link
            href={data.previous ? `/vendor/orders?page=${currentPage - 1}` : "#"}
            aria-disabled={!data.previous}
            className={`text-sm font-medium px-4 py-2 rounded-lg border transition-colors
                        ${data.previous
                          ? "border-gray-300 hover:border-[#FDA600] text-gray-700"
                          : "border-gray-100 text-gray-300 pointer-events-none"}`}
          >
            ← Previous
          </Link>
          <span className="text-xs text-gray-400">
            Page {currentPage} · {data.count} total
          </span>
          <Link
            href={data.next ? `/vendor/orders?page=${currentPage + 1}` : "#"}
            aria-disabled={!data.next}
            className={`text-sm font-medium px-4 py-2 rounded-lg border transition-colors
                        ${data.next
                          ? "border-gray-300 hover:border-[#FDA600] text-gray-700"
                          : "border-gray-100 text-gray-300 pointer-events-none"}`}
          >
            Next →
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrderTable;
