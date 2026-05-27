"use client";

import { useState, useEffect } from "react";
import { useGlobalSettings, useUpdateGlobalSettings } from "@/features/settings";
import { Loader2, Shield, Settings, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function AdminSettingsPage() {
  const { data: globalSettings, isLoading, isError } = useGlobalSettings();
  const updateSettingsMutation = useUpdateGlobalSettings();

  // Local state for settings form
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowVendorReg, setAllowVendorReg] = useState(true);
  const [minPayout, setMinPayout] = useState<string | number>("10000");
  const [commissionRate, setCommissionRate] = useState<string | number>("10");
  const [kycForVendors, setKycForVendors] = useState(true);
  const [kycForClients, setKycForClients] = useState(false);

  useEffect(() => {
    if (globalSettings) {
      setMaintenanceMode(!!globalSettings.maintenance_mode);
      setAllowVendorReg(!!globalSettings.allow_vendor_registration);
      setMinPayout(globalSettings.min_payout_amount ?? "10000");
      setCommissionRate(globalSettings.platform_commission_rate ?? "10");
      setKycForVendors(!!globalSettings.kyc_required_for_vendors);
      setKycForClients(!!globalSettings.kyc_required_for_clients);
    }
  }, [globalSettings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate({
      maintenance_mode: maintenanceMode,
      allow_vendor_registration: allowVendorReg,
      min_payout_amount: minPayout,
      platform_commission_rate: commissionRate,
      kyc_required_for_vendors: kycForVendors,
      kyc_required_for_clients: kycForClients,
    });
  };

  return (
    <div className="space-y-10 bg-inherit min-h-screen pb-12 font-satoshi">
      {/* Header Banner */}
      <div>
        <h3 className="font-bon_foyage text-4xl text-black md:text-5xl">
          Platform Settings
        </h3>
        <p className="text-sm text-[#5A6465] mt-1">
          Configure global business thresholds, maintenance overlays, and authentication requirement gates.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 text-[#01454A] animate-spin" />
          <p className="text-sm text-[#5A6465] animate-pulse">Loading platform configuration...</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto space-y-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-full">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <p className="font-bon_foyage text-xl text-black">Failed to load settings</p>
            <p className="text-sm text-[#5A6465] mt-1">
              Ensure the database settings table is initialized and your user account has administrative clearance.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="w-full bg-[#F8F5ED]/40 border border-[#ECE6D6] rounded-[32px] p-6 md:p-8 space-y-8">
          
          {/* Section 1: Maintenance & Onboarding Gating */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-[#ECE6D6]/80 pb-3">
              <Settings className="w-5 h-5 text-[#01454A]" />
              <h4 className="font-bon_foyage text-xl text-black">Gating & Mode Overrides</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Maintenance Toggle */}
              <label className="flex items-start gap-4 bg-white border border-[#ECE6D6] rounded-2xl p-5 cursor-pointer hover:bg-white/80 transition select-none">
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="w-5 h-5 rounded text-[#01454A] focus:ring-[#01454A] accent-[#01454A] mt-1 cursor-pointer"
                />
                <div className="space-y-1">
                  <span className="font-bold text-sm text-black block">Maintenance Overhaul Mode</span>
                  <span className="text-xs text-[#5A6465] leading-relaxed block">
                    Blocks client shop front checkouts and vendor inventory dashboard additions. Displays standard maintenance overlay.
                  </span>
                </div>
              </label>

              {/* Vendor Registration Toggle */}
              <label className="flex items-start gap-4 bg-white border border-[#ECE6D6] rounded-2xl p-5 cursor-pointer hover:bg-white/80 transition select-none">
                <input
                  type="checkbox"
                  checked={allowVendorReg}
                  onChange={(e) => setAllowVendorReg(e.target.checked)}
                  className="w-5 h-5 rounded text-[#01454A] focus:ring-[#01454A] accent-[#01454A] mt-1 cursor-pointer"
                />
                <div className="space-y-1">
                  <span className="font-bold text-sm text-black block">Allow New Tailor Registrations</span>
                  <span className="text-xs text-[#5A6465] leading-relaxed block">
                    Enables or disables sign-up buttons on vendor portals. Suspends new fashion house registrations.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Section 2: KYC Compliance requirements */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-[#ECE6D6]/80 pb-3">
              <Shield className="w-5 h-5 text-[#01454A]" />
              <h4 className="font-bon_foyage text-xl text-black">Compliance & KYC Rules</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* KYC for Vendors */}
              <label className="flex items-start gap-4 bg-white border border-[#ECE6D6] rounded-2xl p-5 cursor-pointer hover:bg-white/80 transition select-none">
                <input
                  type="checkbox"
                  checked={kycForVendors}
                  onChange={(e) => setKycForVendors(e.target.checked)}
                  className="w-5 h-5 rounded text-[#01454A] focus:ring-[#01454A] accent-[#01454A] mt-1 cursor-pointer"
                />
                <div className="space-y-1">
                  <span className="font-bold text-sm text-black block">Force Vendor KYC Completion</span>
                  <span className="text-xs text-[#5A6465] leading-relaxed block">
                    Vendors must pass legal NIN document upload verification before listing catalog garments or initiating bank withdrawals.
                  </span>
                </div>
              </label>

              {/* KYC for Clients */}
              <label className="flex items-start gap-4 bg-white border border-[#ECE6D6] rounded-2xl p-5 cursor-pointer hover:bg-white/80 transition select-none">
                <input
                  type="checkbox"
                  checked={kycForClients}
                  onChange={(e) => setKycForClients(e.target.checked)}
                  className="w-5 h-5 rounded text-[#01454A] focus:ring-[#01454A] accent-[#01454A] mt-1 cursor-pointer"
                />
                <div className="space-y-1">
                  <span className="font-bold text-sm text-black block">Enforce Client KYC Gate</span>
                  <span className="text-xs text-[#5A6465] leading-relaxed block">
                    Clients must complete identification verification before placing custom custom design orders exceeding platform thresholds.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Section 3: Financial Thresholds */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-[#ECE6D6]/80 pb-3">
              <Settings className="w-5 h-5 text-[#01454A]" />
              <h4 className="font-bon_foyage text-xl text-black">Financial Thresholds & Commissions</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Commission Rate */}
              <div className="flex flex-col gap-2 bg-white border border-[#ECE6D6] rounded-2xl p-5">
                <label htmlFor="commission_rate" className="font-bold text-sm text-black">
                  Platform Commission Rate (%)
                </label>
                <p className="text-xs text-[#5A6465] leading-relaxed">
                  Platform-wide baseline transaction fee rate deducted automatically from tailors' completed orders revenue.
                </p>
                <input
                  id="commission_rate"
                  type="number"
                  min="0"
                  max="100"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  className="px-4 w-full bg-[#F8F5ED]/50 outline-none rounded-xl h-12 border border-[#ECE6D6] text-sm text-black focus:border-[#01454A] transition"
                />
              </div>

              {/* Min Payout Amount */}
              <div className="flex flex-col gap-2 bg-white border border-[#ECE6D6] rounded-2xl p-5">
                <label htmlFor="min_payout" className="font-bold text-sm text-black">
                  Minimum Vendor Payout Balance (₦)
                </label>
                <p className="text-xs text-[#5A6465] leading-relaxed">
                  Minimum bank withdrawal ledger balance a tailor house must hold before platform releases settlement transfer funds.
                </p>
                <input
                  id="min_payout"
                  type="number"
                  min="0"
                  value={minPayout}
                  onChange={(e) => setMinPayout(e.target.value)}
                  className="px-4 w-full bg-[#F8F5ED]/50 outline-none rounded-xl h-12 border border-[#ECE6D6] text-sm text-black focus:border-[#01454A] transition"
                />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-6 pt-6 border-t border-[#ECE6D6]/80">
            <button
              type="submit"
              disabled={updateSettingsMutation.isPending}
              className="py-3 px-8 bg-[#01454A] hover:bg-[#01454A]/90 text-[#F8F5ED] hover:text-[#FDA600] font-bold text-sm rounded-xl shadow-md transition duration-200 flex items-center gap-2"
            >
              {updateSettingsMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>

        </form>
      )}
    </div>
  );
}
