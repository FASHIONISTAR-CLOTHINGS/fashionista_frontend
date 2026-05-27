"use client";

import { useState } from "react";
import {
  Search,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

interface PaymentTransaction {
  id: string;
  clientName: string;
  amount: number;
  gateway: "stripe" | "paystack" | "wallet";
  status: "success" | "pending" | "failed";
  orderId: string;
  created_at: string;
}

const MOCK_PAYMENTS: PaymentTransaction[] = [
  {
    id: "TXN-7731",
    clientName: "Amara Kalu",
    amount: 350000,
    gateway: "stripe",
    status: "success",
    orderId: "ORD-9912",
    created_at: "2026-05-26 14:32",
  },
  {
    id: "TXN-7732",
    clientName: "Tobi Adebayo",
    amount: 280000,
    gateway: "stripe",
    status: "pending",
    orderId: "ORD-9913",
    created_at: "2026-05-26 15:10",
  },
  {
    id: "TXN-7733",
    clientName: "Ngozi Echem",
    amount: 195000,
    gateway: "paystack",
    status: "success",
    orderId: "ORD-9914",
    created_at: "2026-05-25 09:44",
  },
];

export default function AdminPaymentPage() {
  const [search, setSearch] = useState("");
  const [selectedTxn, setSelectedTxn] = useState<PaymentTransaction | null>(null);

  const filteredPayments = MOCK_PAYMENTS.filter((payment) =>
    payment.clientName.toLowerCase().includes(search.toLowerCase()) ||
    payment.id.toLowerCase().includes(search.toLowerCase()) ||
    payment.orderId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 bg-inherit min-h-screen pb-12 font-satoshi">
      {/* Header Banner */}
      <div>
        <h3 className="font-bon_foyage text-4xl text-black md:text-5xl">
          Transactions & Payments
        </h3>
        <p className="text-sm text-[#5A6465] mt-1">
          Audit global checkout credit transactions, reconcile payment gateways, and trigger manual admin overrides.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#fff] rounded-[20px] shadow-sm p-6 border border-[#ECE6D6] flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Volume Today</span>
            <span className="font-bon_foyage text-3xl text-black">₦825,000</span>
          </div>
          <div className="p-3 bg-[#C5FECB] text-emerald-700 rounded-full">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#fff] rounded-[20px] shadow-sm p-6 border border-[#ECE6D6] flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Stripe Gateway</span>
            <span className="font-bon_foyage text-3xl text-black">Active</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#fff] rounded-[20px] shadow-sm p-6 border border-[#ECE6D6] flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Failed Checkouts</span>
            <span className="font-bon_foyage text-3xl text-red-500">0.02%</span>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-full">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Directory List */}
      <div className="w-full bg-[#F8F5ED]/40 border border-[#ECE6D6] rounded-[32px] p-6 md:p-8 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A9596]" />
          <input
            type="text"
            placeholder="Search payments by client name, transaction hash, or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white border border-[#ECE6D6] focus:border-[#01454A] rounded-2xl outline-none text-sm text-black placeholder:text-[#8A9596] transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPayments.map((payment) => (
            <div
              key={payment.id}
              onClick={() => setSelectedTxn(payment)}
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
      </div>

      {/* Details drawer */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md h-full bg-[#F8F5ED] p-6 md:p-8 overflow-y-auto shadow-2xl flex flex-col justify-between border-l border-[#ECE6D6] animate-in slide-in-from-right duration-300">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#5A6465]">
                  Transaction Inspector
                </span>
                <button
                  onClick={() => setSelectedTxn(null)}
                  className="p-1 rounded-full border border-[#ECE6D6] bg-white hover:bg-black hover:text-white transition"
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

            <div className="pt-6 border-t border-[#ECE6D6]/80 bg-inherit space-y-3">
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
