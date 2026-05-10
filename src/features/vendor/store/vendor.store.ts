import { create } from "zustand";
import type {
  VendorDashboard,
  VendorProfile,
  VendorSetupState,
} from "@/features/vendor/types/vendor.types";

interface VendorUIState {
  profile: VendorProfile | null;
  setupState: VendorSetupState | null;
  dashboard: VendorDashboard | null;
  setProfile: (profile: VendorProfile | null) => void;
  setSetupState: (setupState: VendorSetupState | null) => void;
  setDashboard: (dashboard: VendorDashboard | null) => void;
  clear: () => void;
}

export const useVendorStore = create<VendorUIState>((set) => ({
  profile: null,
  setupState: null,
  dashboard: null,
  setProfile: (profile) => set({ profile }),
  setSetupState: (setupState) => set({ setupState }),
  setDashboard: (dashboard) => set({ dashboard }),
  clear: () => set({ profile: null, setupState: null, dashboard: null }),
}));
