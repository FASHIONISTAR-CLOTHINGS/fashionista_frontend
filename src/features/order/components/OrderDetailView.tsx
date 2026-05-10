"use client";

/**
 * @file OrderDetailView.tsx
 * @description Shared client/vendor/admin order detail view.
 */
import Link from "next/link";
import { ArrowLeft, PackageCheck } from "lucide-react";
import {
  useAdminOrderDetail,
  useOrderDetail,
  useVendorOrderDetail,
} from "../hooks/use-order";

type Props = {
  orderId: string;
  backHref: string;
  scope?: "client" | "vendor" | "admin";
};

export default function OrderDetailView({ orderId, backHref, scope = "client" }: Props) {
  const clientQuery = useOrderDetail(orderId, scope === "client");
  const vendorQuery = useVendorOrderDetail(orderId, scope === "vendor");
  const adminQuery = useAdminOrderDetail(orderId, scope === "admin");
  const activeQuery =
    scope === "vendor" ? vendorQuery : scope === "admin" ? adminQuery : clientQuery;
  const { data: order, isLoading, isError } = activeQuery;

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-xl bg-white shadow-sm" />;
  }

  if (isError || !order) {
    return (
      <div className="rounded-xl bg-white p-8 text-sm text-red-600 shadow-sm">
        Order detail could not be loaded.
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-medium text-[#01454A]">
        <ArrowLeft size={16} />
        Back to orders
      </Link>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="font-bon_foyage text-5xl text-black">{order.order_number}</h1>
            <p className="mt-2 text-sm text-[#5A6465]">
              {new Date(order.created_at).toLocaleString("en-NG")}
            </p>
          </div>
          <div className="rounded-lg bg-[#FFFBF0] px-4 py-3 text-sm font-semibold capitalize text-[#01454A]">
            {order.status.replace(/_/g, " ")}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <Metric label="Total" value={`${order.currency} ${Number(order.final_total).toLocaleString("en-NG")}`} />
          <Metric label="Payment" value={order.payment_status} />
          <Metric label="Escrow" value={order.escrow_status} />
          <Metric label="Items" value={String(order.item_count)} />
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <PackageCheck size={18} className="text-[#FDA600]" />
          <h2 className="text-base font-semibold text-black">Order Items</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 py-4 text-sm">
              <div>
                <p className="font-medium text-black">{item.product_title}</p>
                <p className="text-xs text-[#5A6465]">
                  Qty {item.quantity} - SKU {item.product_sku || "N/A"}
                </p>
              </div>
              <p className="font-semibold text-black">
                {order.currency} {Number(item.line_total).toLocaleString("en-NG")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#F8F9FC] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#858585]">{label}</p>
      <p className="mt-1 text-sm font-semibold capitalize text-black">{value}</p>
    </div>
  );
}
