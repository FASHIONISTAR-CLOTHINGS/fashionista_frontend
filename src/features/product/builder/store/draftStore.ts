import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface DraftState {
  draft_key: string | null;
  idempotency_key: string | null;
  current_step: number;
  payload: Record<string, any>;
  syncStatus: "idle" | "saving" | "synced" | "failed";
  lastSyncedAt: string | null;

  // Actions
  setDraftKey: (key: string | null) => void;
  setIdempotencyKey: (key: string | null) => void;
  setCurrentStep: (step: number) => void;
  setPayload: (payload: Record<string, any>) => void;
  setSyncStatus: (status: "idle" | "saving" | "synced" | "failed") => void;
  setLastSyncedAt: (time: string | null) => void;
  resetStore: () => void;
  saveBackup: () => void;
  loadBackup: () => boolean;
  clearBackup: () => void;
}

export const useDraftStore = create<DraftState>()(
  persist(
    (set, get) => ({
      draft_key: null,
      idempotency_key: null,
      current_step: 1,
      payload: {},
      syncStatus: "idle",
      lastSyncedAt: null,

      setDraftKey: (key) => set({ draft_key: key }),
      setIdempotencyKey: (key) => set({ idempotency_key: key }),
      setCurrentStep: (step) => {
        set({ current_step: step });
        get().saveBackup();
      },
      setPayload: (payload) => {
        set((state) => ({ payload: { ...state.payload, ...payload } }));
        get().saveBackup();
      },
      setSyncStatus: (status) => set({ syncStatus: status }),
      setLastSyncedAt: (time) => set({ lastSyncedAt: time }),
      resetStore: () => {
        get().clearBackup();
        set({
          draft_key: null,
          idempotency_key: null,
          current_step: 1,
          payload: {},
          syncStatus: "idle",
          lastSyncedAt: null,
        });
      },

      // Backup to localStorage for tab close recovery
      saveBackup: () => {
        if (typeof window === "undefined") return;
        const { draft_key, idempotency_key, current_step, payload } = get();
        if (!draft_key) return;

        const backupData = {
          draft_key,
          idempotency_key,
          current_step,
          payload,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem(
          "fashionistar_product_builder_draft_backup",
          JSON.stringify(backupData)
        );
      },

      loadBackup: () => {
        if (typeof window === "undefined") return false;
        try {
          const raw = localStorage.getItem("fashionistar_product_builder_draft_backup");
          if (!raw) return false;
          const parsed = JSON.parse(raw);
          if (parsed && parsed.draft_key) {
            set({
              draft_key: parsed.draft_key,
              idempotency_key: parsed.idempotency_key,
              current_step: parsed.current_step,
              payload: parsed.payload || {},
              syncStatus: "idle",
              lastSyncedAt: parsed.savedAt || null,
            });
            return true;
          }
        } catch (e) {
          console.error("Failed to load local storage draft backup", e);
        }
        return false;
      },

      clearBackup: () => {
        if (typeof window === "undefined") return;
        localStorage.removeItem("fashionistar_product_builder_draft_backup");
      },
    }),
    {
      name: "fashionistar-product-builder-draft-active",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? sessionStorage : localStorage
      ),
    }
  )
);
