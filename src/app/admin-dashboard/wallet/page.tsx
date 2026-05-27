"use client";

import { useState } from "react";
import {
  Search,
  Wallet,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Shield,
  Loader2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  DollarSign,
} from "lucide-react";

interface WalletEntry {
  id: string;
  storeName: string;
  availableBalance: number;
  escrowBalance: number;
  totalPayouts: number;
  lastPayoutDate: string;
  status: "active" | "frozen";
}

const MOCK_WALLETS: WalletEntry[] = [
  {
    id: "WLT-081",
    storeName: "Deji Luxury",
    availableBalance: 420000,
    escrowBalance: 350000,
    totalPayouts: 2400000,
    lastPayoutDate: "2026-05-20",
    status: "active",
  },
  {
    id: "WLT-082",
    storeName: "Vanguard Tailors",
    availableBalance: 180000,
    escrowBalance: 280000,
    totalPayouts: 1850000,
    lastPayoutDate: "2026-05-18",
    status: "active",
  },
  {
    id: "WLT-083",
    storeName: "Eze Couture",
    availableBalance: 95000,
    escrowBalance: 195000,
    totalPayouts: 920000,
    lastPayoutDate: "2026-05-10",
    status: "active",
  },
];

export default function AdminWalletPage() {
  const [search, setSearch] = useState("");
  const [selectedWallet, setSelectedWallet] = useState<WalletEntry | null>(null);

  const filteredWallets = MOCK_WALLETS.filter((wallet) =>
    wallet.storeName.toLowerCase().includes(search.toLowerCase()) ||
    wallet.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 bg-inherit min-h-screen pb-12 font-satoshi">
      {/* Header Banner */}
      <div>
        <h3 className="font-bon_foyage text-4xl text-black md:text-5xl">
          Wallets & Ledger
        </h3>
        <p className="text-sm text-[#5A6465] mt-1">
          Monitor tailor bank balances, audit ledger log events, and trace escrow status transitions.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#fff] rounded-[20px] shadow-sm p-6 border border-[#ECE6D6] flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Global Escrow Hold</span>
            <span className="font-bon_foyage text-3xl text-black">₦825,000</span>
          </div>
          <div className="p-3 bg-[#FEF3D3] text-[#FDA600] rounded-full">
            <Shield className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#fff] rounded-[20px] shadow-sm p-6 border border-[#ECE6D6] flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Available Seller Funds</span>
            <span className="font-bon_foyage text-3xl text-black">₦695,000</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#fff] rounded-[20px] shadow-sm p-6 border border-[#ECE6D6] flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Platform Gross Payouts</span>
            <span className="font-bon_foyage text-3xl text-[#20AB2C]">₦5,170,000</span>
          </div>
          <div className="p-3 bg-[#C5FECB] text-emerald-700 rounded-full">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main wallets directory */}
      <div className="w-full bg-[#F8F5ED]/40 border border-[#ECE6D6] rounded-[32px] p-6 md:p-8 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A9596]" />
          <input
            type="text"
            placeholder="Search wallets by tailored store name or ledger ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white border border-[#ECE6D6] focus:border-[#01454A] rounded-2xl outline-none text-sm text-black placeholder:text-[#8A9596] transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWallets.map((wallet) => (
            <div
              key={wallet.id}
              onClick={() => setSelectedWallet(wallet)}
              className="bg-white border border-[#ECE6D6] hover:border-[#01454A] rounded-[24px] p-5 shadow-xs hover:shadow transition duration-200 cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#8A9596]">{wallet.id}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      wallet.status === "active"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : "bg-red-50 text-red-500 border border-red-100"
                    }`}
                  >
                    {wallet.status.toUpperCase()}
                  </span>
                </div>

                <div>
                  <h4 className="font-bon_foyage text-lg text-black">{wallet.storeName}</h4>
                </div>

                <div className="space-y-2 pt-3 border-t border-[#ECE6D6]/40 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#8A9596]">Available Balance</span>
                    <span className="font-bold text-[#01454A]">₦{wallet.availableBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A9596]">Escrow Reserve</span>
                    <span className="font-bold text-black">₦{wallet.escrowBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A9596]">Gross Payouts</span>
                    <span className="font-semibold text-emerald-600">₦{wallet.totalPayouts.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-[#ECE6D6]/30 text-[10px] text-[#8A9596]">
                Last Withdrawal: {wallet.lastPayoutDate}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Details drawer */}
      {selectedWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md h-full bg-[#F8F5ED] p-6 md:p-8 overflow-y-auto shadow-2xl flex flex-col justify-between border-l border-[#ECE6D6] animate-in slide-in-from-right duration-300">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#5A6465]">
                  Wallet Audit Details
                </span>
                <button
                  onClick={() => setSelectedWallet(null)}
                  className="p-1 rounded-full border border-[#ECE6D6] bg-white hover:bg-black hover:text-white transition"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 border-b border-[#ECE6D6]/80">
                <span className="font-mono text-xs text-[#8A9596] block">{selectedWallet.id}</span>
                <h4 className="font-bon_foyage text-2xl text-black mt-1">
                  {selectedWallet.storeName}
                </h4>
              </div>

              <div className="space-y-4 bg-white border border-[#ECE6D6] rounded-2xl p-5 text-sm">
                <p className="font-bon_foyage text-lg text-black border-b border-[#ECE6D6]/50 pb-2">
                  Ledger Balances
                </p>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-[#8A9596] block">Settled Available Balance</span>
                    <span className="text-[#01454A] font-bold text-xl">₦{selectedWallet.availableBalance.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#8A9596] block">Escrow Holds</span>
                    <span className="text-black font-semibold text-lg">₦{selectedWallet.escrowBalance.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#ECE6D6]/80 bg-inherit space-y-3">
              <Link
                href={`${process.env.NEXT_PUBLIC_API_V1_URL || "http://127.0.0.1:8001"}/admin/wallet/wallet/${selectedWallet.id}/change/`}
                target="_blank"
                className="w-full bg-[#01454A] hover:bg-[#01454A]/90 text-white font-bold text-sm py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition"
              >
                <DollarSign className="w-4 h-4" />
                Open In Django Super-Admin
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
