/**
 * @file scanStore.ts
 * @description Zustand store for scan flow state (T-018).
 *
 * Manages:
 *   - Pre-scan user inputs (age, sex, height)
 *   - Current scan phase
 *   - Encrypted front-pose landmarks for refresh-resume
 *   - Session ID
 *   - Error state
 *
 * This store is intentionally separate from the useMeasurementCapture hook
 * so that the MeasurementEntryModal can write user inputs before the hook
 * initializes (e.g. before camera permission is requested).
 */

import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";

export type ScanPhase =
  | "idle"
  | "entry"           // User is filling the entry modal
  | "loading_model"   // MediaPipe loading
  | "capturing_front"  // Front pose capture
  | "validating_front"
  | "side_prompt"     // Ask user for side pose
  | "capturing_side"
  | "validating_side"
  | "submitting"
  | "processing"
  | "completed"
  | "failed";

export type UserSex = "male" | "female" | "neutral";

export interface ScanState {
  // Pre-scan inputs
  age: number | null;
  sex: UserSex | null;
  heightCm: number | null;
  weightKg: number | null;

  // Scan lifecycle
  phase: ScanPhase;
  sessionId: string | null;
  error: string | null;

  // Persistence for the enhanced capture flow
  enhancedPhase: string | null;
  frontLandmarksCipher: string | null;
  lastPersistedAt: number | null;

  // Actions
  setEntryData: (data: { age: number; sex: UserSex; heightCm: number; weightKg?: number }) => void;
  setPhase: (phase: ScanPhase) => void;
  setSessionId: (id: string | null) => void;
  setError: (error: string | null) => void;
  setEnhancedPhase: (phase: string | null) => void;
  setFrontLandmarksCipher: (cipher: string | null) => void;
  persistEnhancedState: (phase: string, cipher: string | null) => void;
  reset: () => void;
}

const initialState = {
  age: null,
  sex: null,
  heightCm: null,
  weightKg: null,
  phase: "idle" as ScanPhase,
  sessionId: null,
  error: null,
  enhancedPhase: null,
  frontLandmarksCipher: null,
  lastPersistedAt: null,
};

export const useScanStore = create<ScanState>()(
  persist(
    (set) => ({
      ...initialState,

      setEntryData: (data) =>
        set({
          age: data.age,
          sex: data.sex,
          heightCm: data.heightCm,
          weightKg: data.weightKg ?? null,
          error: null,
        }),

      setPhase: (phase) => set({ phase }),

      setSessionId: (sessionId) => set({ sessionId }),

      setError: (error) => set({ error }),

      setEnhancedPhase: (enhancedPhase) => set({ enhancedPhase }),

      setFrontLandmarksCipher: (frontLandmarksCipher) => set({ frontLandmarksCipher }),

      persistEnhancedState: (enhancedPhase, frontLandmarksCipher) =>
        set({
          enhancedPhase,
          frontLandmarksCipher,
          lastPersistedAt: Date.now(),
        }),

      reset: () => set({ ...initialState }),
    }),
    {
      name: "fashionistar-scan-store",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return { getItem: () => null, setItem: () => {}, removeItem: () => {} } as unknown as StateStorage;
        }
        return localStorage;
      }),
      partialize: (state) => ({
        age: state.age,
        sex: state.sex,
        heightCm: state.heightCm,
        weightKg: state.weightKg,
        sessionId: state.sessionId,
        phase: state.phase,
        enhancedPhase: state.enhancedPhase,
        frontLandmarksCipher: state.frontLandmarksCipher,
        lastPersistedAt: state.lastPersistedAt,
      }),
    }
  )
);
