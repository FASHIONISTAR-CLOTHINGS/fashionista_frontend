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
  /** Tracks whether a product draft session is currently in-flight (Wave 4). */
  activeDraftKey: string | null;
  setProfile: (profile: VendorProfile | null) => void;
  setSetupState: (setupState: VendorSetupState | null) => void;
  setDashboard: (dashboard: VendorDashboard | null) => void;
  setActiveDraftKey: (key: string | null) => void;
  clear: () => void;
}

export const useVendorStore = create<VendorUIState>((set) => ({
  profile: null,
  setupState: null,
  dashboard: null,
  activeDraftKey: null,
  setProfile: (profile) => set({ profile }),
  setSetupState: (setupState) => set({ setupState }),
  setDashboard: (dashboard) => set({ dashboard }),
  setActiveDraftKey: (activeDraftKey) => set({ activeDraftKey }),
  clear: () => set({ profile: null, setupState: null, dashboard: null, activeDraftKey: null }),
}));
