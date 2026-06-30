import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type LocalSaveStatus = "idle" | "saving" | "saved" | "failed";

const LOCAL_SNAPSHOT_KEY = "fashionistar_product_builder_local_snapshot";

function browserSessionStorage() {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    };
  }
  return window.sessionStorage;
}

export interface DraftState {
  localDraftKey: string | null;
  idempotencyKey: string | null;
  currentStep: number;
  payload: Record<string, any>;
  saveStatus: LocalSaveStatus;
  lastSavedAt: string | null;

  setLocalDraftKey: (key: string | null) => void;
  setIdempotencyKey: (key: string | null) => void;
  setCurrentStep: (step: number) => void;
  setPayload: (payload: Record<string, any>) => void;
  setSaveStatus: (status: LocalSaveStatus) => void;
  setLastSavedAt: (time: string | null) => void;
  resetStore: () => void;
  saveSnapshot: () => void;
  loadSnapshot: () => boolean;
  clearSnapshot: () => void;
}

/**
 * Browser-only recovery store for unfinished product creation.
 *
 * Session storage keeps the active wizard fast inside the current tab, while the
 * localStorage snapshot survives browser closes. Nothing in this store sends
 * product draft state to the backend; only final product create/update APIs do.
 */
export const useDraftStore = create<DraftState>()(
  persist(
    (set, get) => ({
      localDraftKey: null,
      idempotencyKey: null,
      currentStep: 1,
      payload: {},
      saveStatus: "idle",
      lastSavedAt: null,

      setLocalDraftKey: (key) => set({ localDraftKey: key }),
      setIdempotencyKey: (key) => set({ idempotencyKey: key }),
      setCurrentStep: (step) => {
        set({ currentStep: step });
        get().saveSnapshot();
      },
      setPayload: (payload) => {
        set({ payload: { ...payload } });
        get().saveSnapshot();
      },
      setSaveStatus: (status) => set({ saveStatus: status }),
      setLastSavedAt: (time) => set({ lastSavedAt: time }),
      resetStore: () => {
        get().clearSnapshot();
        set({
          localDraftKey: null,
          idempotencyKey: null,
          currentStep: 1,
          payload: {},
          saveStatus: "idle",
          lastSavedAt: null,
        });
      },
      saveSnapshot: () => {
        if (typeof window === "undefined") return;
        const { localDraftKey, idempotencyKey, currentStep, payload } = get();
        if (!localDraftKey) return;

        const savedAt = new Date().toISOString();
        set({ lastSavedAt: savedAt, saveStatus: "saved" });

        window.localStorage.setItem(
          LOCAL_SNAPSHOT_KEY,
          JSON.stringify({
            localDraftKey,
            idempotencyKey,
            currentStep,
            payload,
            savedAt,
          }),
        );
      },
      loadSnapshot: () => {
        if (typeof window === "undefined") return false;
        try {
          const raw = window.localStorage.getItem(LOCAL_SNAPSHOT_KEY);
          if (!raw) return false;
          const parsed = JSON.parse(raw);
          if (!parsed?.localDraftKey) return false;

          set({
            localDraftKey: parsed.localDraftKey,
            idempotencyKey: parsed.idempotencyKey ?? null,
            currentStep: parsed.currentStep ?? 1,
            payload: parsed.payload || {},
            saveStatus: "idle",
            lastSavedAt: parsed.savedAt || null,
          });
          return true;
        } catch (error) {
          console.error("Failed to load local product builder snapshot", error);
          set({ saveStatus: "failed" });
          return false;
        }
      },
      clearSnapshot: () => {
        if (typeof window === "undefined") return;
        window.localStorage.removeItem(LOCAL_SNAPSHOT_KEY);
      },
    }),
    {
      name: "fashionistar-product-builder-local-session",
      storage: createJSONStorage(browserSessionStorage),
    },
  ),
);
