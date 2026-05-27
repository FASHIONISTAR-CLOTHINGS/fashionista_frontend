"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Server,
  CheckCircle2,
  XCircle,
  Activity,
  ChevronRight,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

interface ApiProvider {
  id: string;
  name: string;
  type: "payment" | "sms" | "email" | "logistics" | "assets";
  status: "healthy" | "degraded" | "down";
  latency: number;
  uptime: number;
  lastChecked: string;
}

const MOCK_PROVIDERS: ApiProvider[] = [
  {
    id: "PRV-01",
    name: "Stripe Payment Gateway",
    type: "payment",
    status: "healthy",
    latency: 120,
    uptime: 99.99,
    lastChecked: "1 min ago",
  },
  {
    id: "PRV-02",
    name: "Paystack Payments Africa",
    type: "payment",
    status: "healthy",
    latency: 180,
    uptime: 99.95,
    lastChecked: "1 min ago",
  },
  {
    id: "PRV-03",
    name: "Twilio SMS & OTP",
    type: "sms",
    status: "healthy",
    latency: 240,
    uptime: 99.9,
    lastChecked: "3 mins ago",
  },
  {
    id: "PRV-04",
    name: "Cloudinary CDN Storage",
    type: "assets",
    status: "healthy",
    latency: 85,
    uptime: 100.0,
    lastChecked: "2 mins ago",
  },
];

export default function AdminProvidersPage() {
  const [search, setSearch] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<ApiProvider | null>(null);

  const filteredProviders = MOCK_PROVIDERS.filter((provider) =>
    provider.name.toLowerCase().includes(search.toLowerCase()) ||
    provider.type.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: ApiProvider["status"]) => {
    switch (status) {
      case "healthy":
        return (
          <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> HEALTHY
          </span>
        );
      case "degraded":
        return (
          <span className="flex items-center gap-1 bg-amber-50 text-[#FDA600] border border-amber-100 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            <Activity className="w-3 h-3" /> DEGRADED
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            <XCircle className="w-3 h-3" /> DOWN
          </span>
        );
    }
  };

  return (
    <div className="space-y-10 bg-inherit min-h-screen pb-12 font-satoshi">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bon_foyage text-4xl text-black md:text-5xl">
            API Integrations &amp; Providers
          </h3>
          <p className="text-sm text-[#5A6465] mt-1">
            Audit third-party cloud connection status, monitor payload latency, and review service uptime.
          </p>
        </div>
        <button
          onClick={() => {}}
          className="border border-[#ECE6D6] bg-white hover:bg-[#F4F3EC] text-black font-bold transition px-5 py-3 rounded-xl shadow-sm text-sm flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Run Live Diagnostics
        </button>
      </div>

      {/* Main Directory */}
      <div className="w-full bg-[#F8F5ED]/40 border border-[#ECE6D6] rounded-[32px] p-6 md:p-8 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A9596]" />
          <input
            type="text"
            placeholder="Search API integrations or gateway providers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white border border-[#ECE6D6] focus:border-[#01454A] rounded-2xl outline-none text-sm text-black placeholder:text-[#8A9596] transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProviders.map((provider) => (
            <div
              key={provider.id}
              onClick={() => setSelectedProvider(provider)}
              className="bg-white border border-[#ECE6D6] hover:border-[#01454A] rounded-[24px] p-6 shadow-xs hover:shadow transition duration-200 cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#8A9596]">{provider.id}</span>
                  {getStatusBadge(provider.status)}
                </div>

                <div>
                  <h4 className="font-bon_foyage text-xl text-black">{provider.name}</h4>
                  <p className="text-xs text-[#01454A] font-bold uppercase mt-1">Type: {provider.type}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#ECE6D6]/40 text-xs">
                  <div>
                    <span className="text-[#8A9596] block">Latency</span>
                    <span className="font-semibold text-black block mt-0.5">{provider.latency} ms</span>
                  </div>
                  <div>
                    <span className="text-[#8A9596] block">Core Uptime</span>
                    <span className="font-semibold text-emerald-600 block mt-0.5">{provider.uptime}%</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-[#ECE6D6]/30 flex items-center justify-between text-[10px] text-[#8A9596]">
                <span>Diagnostics: {provider.lastChecked}</span>
                <span className="font-bold flex items-center gap-0.5 text-[#01454A] group-hover:translate-x-0.5 transition">
                  Audit <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Details drawer */}
      {selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md h-full bg-[#F8F5ED] p-6 md:p-8 overflow-y-auto shadow-2xl flex flex-col justify-between border-l border-[#ECE6D6] animate-in slide-in-from-right duration-300">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#5A6465]">
                  Diagnostics Inspector
                </span>
                <button
                  onClick={() => setSelectedProvider(null)}
                  className="p-1 rounded-full border border-[#ECE6D6] bg-white hover:bg-black hover:text-white transition"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 border-b border-[#ECE6D6]/80 flex items-center gap-3">
                <div className="p-3 bg-[#01454A]/5 text-[#01454A] rounded-xl border border-[#01454A]/15">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-mono text-xs text-[#8A9596] block">{selectedProvider.id}</span>
                  <h4 className="font-bon_foyage text-2xl text-black">
                    {selectedProvider.name}
                  </h4>
                </div>
              </div>

              <div className="space-y-4 bg-white border border-[#ECE6D6] rounded-2xl p-5 text-sm">
                <p className="font-bon_foyage text-lg text-black border-b border-[#ECE6D6]/50 pb-2">
                  Diagnostics Overview
                </p>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-[#8A9596] block">Provider Uptime SLA</span>
                    <span className="text-[#01454A] font-bold text-lg">{selectedProvider.uptime}%</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#8A9596] block">Average Payload Latency</span>
                    <span className="text-black font-semibold text-lg">{selectedProvider.latency} ms</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#ECE6D6]/80 bg-inherit space-y-3">
              <Link
                href={`${process.env.NEXT_PUBLIC_API_V1_URL || "http://127.0.0.1:8001"}/admin/providers/providerprofile/${selectedProvider.id}/change/`}
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
