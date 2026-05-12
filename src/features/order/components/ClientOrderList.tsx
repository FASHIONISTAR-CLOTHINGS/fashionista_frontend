/**
 * @file ClientOrderList.tsx
 * @description Client-facing order history wired to the canonical Ninja read plane.
 */
"use client";

import Link from "next/link";
import { Package, ReceiptText } from "lucide-react";
import { useClientOrders, useNinjaClientOrderCounts } from "../hooks/use-order";

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Pending payment",
  payment_confirmed: "Payment confirmed",
  processing: "Processing",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
  refund_requested: "Refund requested",
  refunded: "Refunded",
  disputed: "Disputed",
};

export default function ClientOrderList() {
  const { data, isLoading, isError } = useClientOrders(1);
  const { data: counts } = useNinjaClientOrderCounts();
  const orders = data?.results ?? [];

  return (
    <section className="space-y-6 px-4 md:px-8 lg:px-10 py-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-black">My Orders</h1>
          <p className="text-sm text-gray-500">
            Track tailoring progress, payment state, delivery, and escrow release.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {["processing", "shipped", "completed"].map((status) => (
            <div key={status} className="rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-sm">
              <p className="text-lg font-semibold text-[#01454A]">{counts?.[status] ?? 0}</p>
              <p className="text-[11px] text-gray-500">{STATUS_LABELS[status]}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="shimmer h-16 rounded-lg" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-sm text-red-500">Failed to load your orders.</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="mx-auto mb-3 text-gray-300" size={42} />
            <p className="text-sm text-gray-500">No orders yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/client/dashboard/orders/${order.id}`}
                className="flex flex-col gap-3 p-4 transition-colors hover:bg-[#FFFBF0] md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1 rounded-lg bg-[#FFF5D6] p-2 text-[#9B6B00]">
                    <ReceiptText size={18} />
                  </span>
                  <div>
                    <p className="font-semibold text-[#01454A]">{order.order_number}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString("en-NG", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm md:min-w-[360px]">
                  <div>
                    <p className="text-[11px] text-gray-400">Items</p>
                    <p className="font-medium text-black">{order.item_count}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400">Total</p>
                    <p className="font-medium text-black">
                      {order.currency} {Number(order.final_total).toLocaleString("en-NG")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400">Status</p>
                    <p className="font-medium capitalize text-[#01454A]">
                      {STATUS_LABELS[order.status] ?? order.status.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
