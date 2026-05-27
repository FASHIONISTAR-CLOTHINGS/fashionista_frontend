"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Scissors,
  XCircle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

interface MeasurementProfile {
  id: string;
  clientName: string;
  bust: number;
  waist: number;
  hips: number;
  shoulder: number;
  height: number;
  unit: "inches" | "cm";
  is_verified: boolean;
  updated_at: string;
}

const MOCK_MEASUREMENTS: MeasurementProfile[] = [
  {
    id: "MS-412",
    clientName: "Amara Kalu",
    bust: 34,
    waist: 26,
    hips: 36,
    shoulder: 15,
    height: 64,
    unit: "inches",
    is_verified: true,
    updated_at: "2026-05-24",
  },
  {
    id: "MS-413",
    clientName: "Tobi Adebayo",
    bust: 40,
    waist: 34,
    hips: 42,
    shoulder: 18,
    height: 70,
    unit: "inches",
    is_verified: false,
    updated_at: "2026-05-20",
  },
  {
    id: "MS-414",
    clientName: "Ngozi Echem",
    bust: 36,
    waist: 28,
    hips: 39,
    shoulder: 16,
    height: 66,
    unit: "inches",
    is_verified: true,
    updated_at: "2026-05-18",
  },
];

export default function AdminMeasurementsPage() {
  const [search, setSearch] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<MeasurementProfile | null>(null);

  const filteredProfiles = MOCK_MEASUREMENTS.filter((profile) =>
    profile.clientName.toLowerCase().includes(search.toLowerCase()) ||
    profile.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 bg-inherit min-h-screen pb-12 font-satoshi">
      {/* Header Banner */}
      <div>
        <h3 className="font-bon_foyage text-4xl text-black md:text-5xl">
          Measurements Directory
        </h3>
        <p className="text-sm text-[#5A6465] mt-1">
          Review luxury client body dimensions and moderate sizing profiles for customized design fulfillment.
        </p>
      </div>

      {/* Main Directory Container */}
      <div className="w-full bg-[#F8F5ED]/40 border border-[#ECE6D6] rounded-[32px] p-6 md:p-8 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A9596]" />
          <input
            type="text"
            placeholder="Search sizing files by client name or custom profile ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white border border-[#ECE6D6] focus:border-[#01454A] rounded-2xl outline-none text-sm text-black placeholder:text-[#8A9596] transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => (
            <div
              key={profile.id}
              onClick={() => setSelectedProfile(profile)}
              className="bg-white border border-[#ECE6D6] hover:border-[#01454A] rounded-[24px] p-5 shadow-xs hover:shadow transition duration-200 cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#8A9596]">{profile.id}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      profile.is_verified
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : "bg-amber-50 text-[#FDA600] border border-amber-100"
                    }`}
                  >
                    {profile.is_verified ? "VERIFIED" : "PENDING"}
                  </span>
                </div>

                <div>
                  <h4 className="font-bon_foyage text-lg text-black">{profile.clientName}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Unit System: {profile.unit}</p>
                </div>

                {/* Sizing grid summary */}
                <div className="grid grid-cols-4 gap-2 text-center pt-3 border-t border-[#ECE6D6]/40 text-xs">
                  <div className="bg-[#F8F5ED]/40 border border-[#ECE6D6]/50 p-2 rounded-lg">
                    <span className="text-[9px] text-[#8A9596] uppercase block">Bust</span>
                    <span className="font-bold text-[#01454A]">{profile.bust}"</span>
                  </div>
                  <div className="bg-[#F8F5ED]/40 border border-[#ECE6D6]/50 p-2 rounded-lg">
                    <span className="text-[9px] text-[#8A9596] uppercase block">Waist</span>
                    <span className="font-bold text-[#01454A]">{profile.waist}"</span>
                  </div>
                  <div className="bg-[#F8F5ED]/40 border border-[#ECE6D6]/50 p-2 rounded-lg">
                    <span className="text-[9px] text-[#8A9596] uppercase block">Hips</span>
                    <span className="font-bold text-[#01454A]">{profile.hips}"</span>
                  </div>
                  <div className="bg-[#F8F5ED]/40 border border-[#ECE6D6]/50 p-2 rounded-lg">
                    <span className="text-[9px] text-[#8A9596] uppercase block">Shoulder</span>
                    <span className="font-bold text-[#01454A]">{profile.shoulder}"</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-[#ECE6D6]/30 flex items-center justify-between text-[10px] text-[#8A9596]">
                <span>Updated: {profile.updated_at}</span>
                <span className="font-bold flex items-center gap-0.5 text-[#01454A] group-hover:translate-x-0.5 transition">
                  Inspect <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Details drawer */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md h-full bg-[#F8F5ED] p-6 md:p-8 overflow-y-auto shadow-2xl flex flex-col justify-between border-l border-[#ECE6D6] animate-in slide-in-from-right duration-300">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#5A6465]">
                  Sizing Inspector
                </span>
                <button
                  onClick={() => setSelectedProfile(null)}
                  className="p-1 rounded-full border border-[#ECE6D6] bg-white hover:bg-black hover:text-white transition"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 border-b border-[#ECE6D6]/80 flex items-center gap-3">
                <div className="p-3 bg-[#01454A]/5 text-[#01454A] rounded-xl border border-[#01454A]/15">
                  <Scissors className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-mono text-xs text-[#8A9596] block">{selectedProfile.id}</span>
                  <h4 className="font-bon_foyage text-2xl text-black">
                    {selectedProfile.clientName}
                  </h4>
                </div>
              </div>

              <div className="space-y-4 bg-white border border-[#ECE6D6] rounded-2xl p-5 text-sm">
                <p className="font-bon_foyage text-lg text-black border-b border-[#ECE6D6]/50 pb-2">
                  Complete Sizing Profile
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-[#8A9596] block">Bust Circumference</span>
                    <span className="text-black font-bold text-lg">{selectedProfile.bust} inches</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#8A9596] block">Waist Circumference</span>
                    <span className="text-black font-bold text-lg">{selectedProfile.waist} inches</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#8A9596] block">Hips Circumference</span>
                    <span className="text-black font-bold text-lg">{selectedProfile.hips} inches</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#8A9596] block">Shoulder Width</span>
                    <span className="text-black font-bold text-lg">{selectedProfile.shoulder} inches</span>
                  </div>
                  <div>
                    <span className="text-xs text-[#8A9596] block">Full Height</span>
                    <span className="text-black font-bold text-lg">{selectedProfile.height} inches</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#ECE6D6]/80 bg-inherit space-y-3">
              <Link
                href={`${process.env.NEXT_PUBLIC_API_V1_URL || "http://127.0.0.1:8001"}/admin/measurements/measurementprofile/${selectedProfile.id}/change/`}
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
