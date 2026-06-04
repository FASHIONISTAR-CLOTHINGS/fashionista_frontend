import { create } from "zustand";
import type {
  VendorDashboard,
  VendorProfile,
  VendorSetupState,
} from "@/features/vendor/types/vendor.types";

interface VendorUIState {
  profile:         VendorProfile | null;
  setupState:      VendorSetupState | null;
  dashboard:       VendorDashboard | null;
  /**
   * activeDraftKey — mirrors the draft_key from useDraftStore for
   * cross-feature access (e.g. Resume Draft banner in vendor shell).
   * Set by VendorProductComposerView when the builder initialises a draft.
   * Cleared when the builder commits or the draft is discarded.
   */
  activeDraftKey:  string | null;
  setProfile:      (profile: VendorProfile | null) => void;
  setSetupState:   (setupState: VendorSetupState | null) => void;
  setDashboard:    (dashboard: VendorDashboard | null) => void;
  setActiveDraftKey: (key: string | null) => void;
  clear: () => void;
}

export const useVendorStore = create<VendorUIState>((set) => ({
  profile:        null,
  setupState:     null,
  dashboard:      null,
  activeDraftKey: null,
  setProfile:         (profile)   => set({ profile }),
  setSetupState:      (setupState) => set({ setupState }),
  setDashboard:       (dashboard) => set({ dashboard }),
  setActiveDraftKey:  (key)       => set({ activeDraftKey: key }),
  clear: () => set({ profile: null, setupState: null, dashboard: null, activeDraftKey: null }),
}));

