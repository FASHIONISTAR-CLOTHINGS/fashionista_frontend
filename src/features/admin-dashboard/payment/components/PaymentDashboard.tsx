"use client";

/**
 * @file PaymentDashboard.tsx
 * @description Premium payment audit and transaction inspection component.
 */

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  CreditCard,
  XCircle,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAdminPayments, useAdminPaymentKPIs } from "../hooks";

export function PaymentDashboard() {
  const [search, setSearch] = useState("");
  const [selectedTxnId, setSelectedTxnId] = useState<string | null>(null);

  const { data: payments = [], isLoading: isLoadingPayments, isError: isErrorPayments } = useAdminPayments();
  const { data: kpis, isLoading: isLoadingKPIs } = useAdminPaymentKPIs();

  const filteredPayments = payments.filter((payment) =>
    payment.clientName.toLowerCase().includes(search.toLowerCase()) ||
    payment.id.toLowerCase().includes(search.toLowerCase()) ||
    payment.orderId.toLowerCase().includes(search.toLowerCase())
  );

  const selectedTxn = payments.find((p) => p.id === selectedTxnId);

  return (
    <div className="space-y-10 bg-inherit min-h-screen pb-12 font-satoshi text-black">
      {/* Header Banner */}
      <div>
        <h3 className="font-bon_foyage text-4xl text-black md:text-5xl">
          Transactions &amp; Payments
        </h3>
        <p className="text-sm text-[#5A6465] mt-1 font-satoshi">
          Audit global checkout credit transactions, reconcile payment gateways, and trigger manual admin overrides.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-satoshi">
        <div className="bg-[#fff] rounded-[20px] shadow-sm p-6 border border-[#ECE6D6] flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Volume Today</span>
            <span className="font-bon_foyage text-3xl text-black">
              ₦{isLoadingKPIs ? "..." : kpis?.volumeToday.toLocaleString()}
            </span>
          </div>
          <div className="p-3 bg-[#C5FECB] text-emerald-700 rounded-full">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#fff] rounded-[20px] shadow-sm p-6 border border-[#ECE6D6] flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Stripe Gateway</span>
            <span className="font-bon_foyage text-3xl text-black">
              {isLoadingKPIs ? "..." : kpis?.stripeStatus}
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#fff] rounded-[20px] shadow-sm p-6 border border-[#ECE6D6] flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Failed Checkouts</span>
            <span className="font-bon_foyage text-3xl text-red-500">
              {isLoadingKPIs ? "..." : `${kpis?.failedCheckouts}%`}
            </span>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-full">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Directory List */}
      <div className="w-full bg-[#F8F5ED]/40 border border-[#ECE6D6] rounded-[32px] p-6 md:p-8 space-y-6">
        <div className="relative font-satoshi">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A9596]" />
          <input
            type="text"
            placeholder="Search payments by client name, transaction hash, or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white border border-[#ECE6D6] focus:border-[#01454A] rounded-2xl outline-none text-sm text-black placeholder:text-[#8A9596] transition-all"
          />
        </div>

        {isLoadingPayments ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 font-satoshi">
            <Loader2 className="w-10 h-10 animate-spin text-[#01454A]" />
            <p className="text-sm text-[#5A6465]">Loading payment records...</p>
          </div>
        ) : isErrorPayments ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-[#ECE6D6] rounded-2xl bg-white font-satoshi">
            <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
            <p className="text-sm text-[#5A6465] font-semibold">Failed to fetch payment records</p>
            <p className="text-xs text-[#8A9596] mt-1">Please try again later or check your backend services.</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-[#ECE6D6] rounded-2xl bg-white font-satoshi">
            <CreditCard className="w-10 h-10 text-gray-300 mb-2" />
            <p className="text-sm text-[#5A6465] font-semibold">No transactions found</p>
            <p className="text-xs text-[#8A9596] mt-1">Try refining your search keyword.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-satoshi">
            {filteredPayments.map((payment) => (
              <div
                key={payment.id}
                onClick={() => setSelectedTxnId(payment.id)}
                className="bg-white border border-[#ECE6D6] hover:border-[#01454A] rounded-[24px] p-5 shadow-xs hover:shadow transition duration-200 cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#8A9596]">{payment.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        payment.status === "success"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : payment.status === "pending"
                            ? "bg-amber-50 text-[#FDA600] border border-amber-100"
                            : "bg-red-50 text-red-500 border border-red-100"
                      }`}
                    >
                      {payment.status.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bon_foyage text-lg text-black">{payment.clientName}</h4>
                    <p className="text-xs text-[#FDA600] font-bold mt-1">₦{payment.amount.toLocaleString()}</p>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-[#ECE6D6]/40 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#8A9596]">Payment Gateway</span>
                      <span className="font-bold text-[#01454A] capitalize">{payment.gateway}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8A9596]">Order Reference</span>
                      <span className="font-bold text-black font-mono">{payment.orderId}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-4 border-t border-[#ECE6D6]/30 flex items-center justify-between text-[10px] text-[#8A9596]">
                  <span>{payment.created_at}</span>
                  <span className="font-bold flex items-center gap-0.5 text-[#01454A] group-hover:translate-x-0.5 transition">
                    Audit <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details drawer */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs font-satoshi">
          <div className="w-full max-w-md h-full bg-[#F8F5ED] p-6 md:p-8 overflow-y-auto shadow-2xl flex flex-col justify-between border-l border-[#ECE6D6] animate-in slide-in-from-right duration-300">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#5A6465]">
                  Transaction Inspector
                </span>
                <button
                  onClick={() => setSelectedTxnId(null)}
                  className="p-1 rounded-full border border-[#ECE6D6] bg-white hover:bg-black hover:text-white transition cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 border-b border-[#ECE6D6]/80">
                <span className="font-mono text-xs text-[#8A9596] block">{selectedTxn.id}</span>
                <h4 className="font-bon_foyage text-2xl text-black mt-1">
                  ₦{selectedTxn.amount.toLocaleString()}
                </h4>
              </div>

              <div className="space-y-4 bg-white border border-[#ECE6D6] rounded-2xl p-5 text-sm">
                <p className="font-bon_foyage text-lg text-black border-b border-[#ECE6D6]/50 pb-2">
                  Ledger Details
                </p>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-[#8A9596] block">Client Name</span>
                    <span className="text-black font-semibold">{selectedTxn.clientName}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#8A9596] block">Order Association</span>
                    <span className="text-black font-semibold font-mono">{selectedTxn.orderId}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#8A9596] block">Gateway Used</span>
                    <span className="text-black font-semibold capitalize">{selectedTxn.gateway}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#ECE6D6]/80 bg-inherit space-y-3 mt-auto">
              <Link
                href={`${process.env.NEXT_PUBLIC_API_V1_URL || "http://127.0.0.1:8001"}/admin/payment/paymenttransaction/${selectedTxn.id}/change/`}
                target="_blank"
                className="w-full bg-[#01454A] hover:bg-[#01454A]/90 text-white font-bold text-sm py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition"
              >
                <ExternalLink className="w-4 h-4" />
                Open In Django Super-Admin
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
