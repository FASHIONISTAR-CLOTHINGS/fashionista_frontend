import { create } from "zustand";
import type {
  ClientDashboard,
  ClientProfile,
} from "@/features/client/types/client.types";

interface ClientUIState {
  profile: ClientProfile | null;
  dashboard: ClientDashboard | null;
  setProfile: (profile: ClientProfile | null) => void;
  setDashboard: (dashboard: ClientDashboard | null) => void;
  clear: () => void;
}

export const useClientStore = create<ClientUIState>((set) => ({
  profile: null,
  dashboard: null,
  setProfile: (profile) => set({ profile }),
  setDashboard: (dashboard) => set({ dashboard }),
  clear: () => set({ profile: null, dashboard: null }),
}));
