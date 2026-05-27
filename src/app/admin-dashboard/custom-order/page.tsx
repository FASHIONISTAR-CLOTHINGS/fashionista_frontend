"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  Eye,
  Settings,
  Mail,
  User,
  Scissors,
  HelpCircle,
  Calendar,
  XCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";
import {
  useAdminCustomOrders,
  useAdminCustomOrderDetail,
  useUpdateAdminCustomOrderStatus,
} from "@/features/custom-order";

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function AdminCustomOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [reasonText, setReasonText] = useState("");

  const { data: orders = [], isLoading, isError } = useAdminCustomOrders({
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const { data: selectedOrder, isLoading: isLoadingDetail } = useAdminCustomOrderDetail(
    selectedOrderId || "",
    !!selectedOrderId
  );

  const statusMutation = useUpdateAdminCustomOrderStatus();

  const handleUpdateStatus = (statusVal: string) => {
    if (!selectedOrderId) return;
    statusMutation.mutate(
      { id: selectedOrderId, status: statusVal, reason: reasonText },
      {
        onSuccess: () => {
          setReasonText("");
        },
      }
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_review":
      case "pending":
        return (
          <span className="flex items-center gap-1 bg-amber-50 text-[#FDA600] border border-amber-100 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            <Clock className="w-3 h-3" /> PENDING REVIEW
          </span>
        );
      case "in_production":
      case "approved":
        return (
          <span className="flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            <Scissors className="w-3 h-3" /> IN PRODUCTION
          </span>
        );
      case "completed":
        return (
          <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3" /> COMPLETED
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 bg-gray-50 text-gray-500 border border-gray-100 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            <HelpCircle className="w-3 h-3" /> {status.replace("_", " ")}
          </span>
        );
    }
  };

  return (
    <div className="space-y-10 bg-inherit min-h-screen pb-12 font-satoshi">
      {/* Header Banner */}
      <div>
        <h3 className="font-bon_foyage text-4xl text-black md:text-5xl">
          Custom & Bespoke Orders
        </h3>
        <p className="text-sm text-[#5A6465] mt-1">
          Monitor customized tailoring commissions, manage production stages, and moderate client designer milestones.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#fff] rounded-[20px] shadow-sm p-6 border border-[#ECE6D6] flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Active Custom Escrows</span>
            <span className="font-bon_foyage text-3xl text-black">₦825,000</span>
          </div>
          <div className="p-3 bg-[#C5FECB] text-emerald-700 rounded-full">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#fff] rounded-[20px] shadow-sm p-6 border border-[#ECE6D6] flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Bespoke in Production</span>
            <span className="font-bon_foyage text-3xl text-black">12 Garments</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <Scissors className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#fff] rounded-[20px] shadow-sm p-6 border border-[#ECE6D6] flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Approvals Waiting</span>
            <span className="font-bon_foyage text-3xl text-[#FDA600]">4 Requests</span>
          </div>
          <div className="p-3 bg-amber-50 text-[#FDA600] rounded-full">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Operations Card */}
      <div className="w-full bg-[#F8F5ED]/40 border border-[#ECE6D6] rounded-[32px] p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="relative md:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A9596]" />
            <input
              type="text"
              placeholder="Search custom orders by designer, client, garment type or order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white border border-[#ECE6D6] focus:border-[#01454A] rounded-2xl outline-none text-sm text-black placeholder:text-[#8A9596] transition-all"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-12 px-4 bg-white border border-[#ECE6D6] focus:border-[#01454A] rounded-2xl outline-none text-sm text-black cursor-pointer"
            >
              <option value="">All Bespoke Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Directory Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-[#01454A] animate-spin" />
            <p className="text-xs text-[#5A6465]">Loading custom bespoke orders...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-20 border border-dashed border-[#ECE6D6] rounded-[24px] bg-white">
            <p className="text-sm text-red-600">Failed to load custom orders. Please refresh the page.</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#ECE6D6] rounded-[24px] bg-white">
            <p className="text-sm text-[#8A9596]">No custom bespoke orders found matching current criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-[#ECE6D6] hover:border-[#01454A] rounded-[24px] p-6 shadow-xs hover:shadow transition duration-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#8A9596]">{order.reference}</span>
                    {getStatusBadge(order.status)}
                  </div>

                  <div>
                    <h4 className="font-bon_foyage text-xl text-black">Bespoke Production Contract</h4>
                    <p className="text-xs text-[#FDA600] font-bold mt-1">₦{Number(order.agreed_amount_ngn || order.budget_ngn).toLocaleString()}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#ECE6D6]/40 text-xs">
                    <div>
                      <span className="text-[#8A9596] block">Client Email</span>
                      <span className="font-semibold text-black flex items-center gap-1 mt-0.5">
                        <User className="w-3 h-3" /> {order.client_email}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8A9596] block">Design House</span>
                      <span className="font-semibold text-[#01454A] flex items-center gap-1 mt-0.5">
                        <Sparkles className="w-3 h-3" /> {order.vendor_store_name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#ECE6D6]/50 text-[10px] text-[#8A9596]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Logged: {formatDate(order.created_at)}
                  </span>
                  <button
                    onClick={() => setSelectedOrderId(order.id)}
                    className="flex items-center gap-1 font-bold text-xs text-[#01454A] hover:text-[#FDA600] transition"
                  >
                    <Eye className="w-4 h-4" /> Inspect Milestones
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details drawer */}
      {selectedOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md h-full bg-[#F8F5ED] p-6 md:p-8 overflow-y-auto shadow-2xl flex flex-col justify-between border-l border-[#ECE6D6] animate-in slide-in-from-right duration-300">
            {isLoadingDetail ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <Loader2 className="w-8 h-8 text-[#01454A] animate-spin" />
                <p className="text-xs text-[#5A6465]">Loading bespoke contract specs...</p>
              </div>
            ) : selectedOrder ? (
              <div className="space-y-6 flex-1 flex flex-col justify-between h-full">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-widest text-[#5A6465]">
                      Bespoke Order Inspector
                    </span>
                    <button
                      onClick={() => setSelectedOrderId(null)}
                      className="p-1 rounded-full border border-[#ECE6D6] bg-white hover:bg-black hover:text-white transition"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="py-4 border-b border-[#ECE6D6]/80">
                    <span className="font-mono text-xs text-[#8A9596] block">{selectedOrder.reference}</span>
                    <h4 className="font-bon_foyage text-2xl text-black mt-1">Bespoke Spec Contract</h4>
                    <div className="mt-2">{getStatusBadge(selectedOrder.status)}</div>
                  </div>

                  <div className="space-y-4 bg-white border border-[#ECE6D6] rounded-2xl p-5 text-sm">
                    <p className="font-bon_foyage text-lg text-black border-b border-[#ECE6D6]/50 pb-2">
                      Transaction Metadata
                    </p>
                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-[#8A9596] block">Agreed Contract Price</span>
                        <span className="text-[#FDA600] font-bold text-sm">₦{Number(selectedOrder.agreed_amount_ngn || selectedOrder.budget_ngn).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[#8A9596] block">Client Contact</span>
                        <span className="text-black font-semibold flex items-center gap-1 mt-0.5">
                          <Mail className="w-3.5 h-3.5 text-[#8A9596]" /> {selectedOrder.client_email}
                        </span>
                      </div>
                      {selectedOrder.design_brief && (
                        <div>
                          <span className="text-[#8A9596] block">Design Brief / Notes</span>
                          <p className="text-[#5A6465] bg-[#F8F5ED]/40 border border-[#ECE6D6]/50 rounded-xl p-3 leading-relaxed mt-1">
                            {selectedOrder.design_brief}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Milestones Listing */}
                  {selectedOrder.milestones && selectedOrder.milestones.length > 0 && (
                    <div className="space-y-4 bg-white border border-[#ECE6D6] rounded-2xl p-5 text-sm">
                      <p className="font-bon_foyage text-lg text-black border-b border-[#ECE6D6]/50 pb-2">
                        Payment & Escrow Milestones
                      </p>
                      <div className="space-y-3">
                        {selectedOrder.milestones.map((ms, index) => (
                          <div key={ms.id} className="flex items-center justify-between text-xs border-b border-gray-150 pb-2 last:border-0 last:pb-0">
                            <div>
                              <p className="font-bold text-black">Milestone {index + 1} ({ms.milestone_pct}%)</p>
                              <p className="text-[#8A9596] text-[10px]">Ref: {ms.payment_reference || "N/A"}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-[#FDA600]">₦{Number(ms.amount_ngn).toLocaleString()}</p>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                ms.payment_status === "paid" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                              }`}>
                                {ms.payment_status.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions / Status Controls */}
                  <div className="space-y-3 bg-white border border-[#ECE6D6] rounded-2xl p-5 text-sm">
                    <p className="font-bon_foyage text-lg text-black border-b border-[#ECE6D6]/50 pb-2">
                      Governance Controls
                    </p>
                    <textarea
                      placeholder="Optional cancellation or transition notes..."
                      value={reasonText}
                      onChange={(e) => setReasonText(e.target.value)}
                      className="w-full h-16 p-2 border border-[#ECE6D6] rounded-xl text-xs outline-none focus:border-[#01454A] resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus("completed")}
                        disabled={statusMutation.isPending || selectedOrder.status === "completed"}
                        className="flex-1 h-9 bg-[#01454A] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50 transition"
                      >
                        {statusMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        Complete Contract
                      </button>
                      <button
                        onClick={() => handleUpdateStatus("cancelled")}
                        disabled={statusMutation.isPending || selectedOrder.status === "cancelled"}
                        className="flex-1 h-9 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50 transition border border-red-200"
                      >
                        Cancel Contract
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#ECE6D6]/80 bg-inherit mt-auto">
                  <Link
                    href={`${process.env.NEXT_PUBLIC_API_V1_URL || "http://127.0.0.1:8001"}/admin/custom_order/customorder/${selectedOrder.id}/change/`}
                    target="_blank"
                    className="w-full bg-[#01454A] hover:bg-[#01454A]/90 text-white font-bold text-sm py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition"
                  >
                    <Settings className="w-4 h-4" />
                    Open In Django Super-Admin
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
