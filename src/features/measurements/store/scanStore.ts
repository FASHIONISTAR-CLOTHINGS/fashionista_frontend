/**
 * @file scanStore.ts
 * @description Zustand store for scan flow state (T-018).
 *
 * Manages:
 *   - Pre-scan user inputs (age, sex, height)
 *   - Current scan phase
 *   - Session ID
 *   - Error state
 *
 * This store is intentionally separate from the useMeasurementCapture hook
 * so that the MeasurementEntryModal can write user inputs before the hook
 * initializes (e.g. before camera permission is requested).
 */

import { create } from "zustand";

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

interface ScanState {
  // Pre-scan inputs
  age: number | null;
  sex: UserSex | null;
  heightCm: number | null;

  // Scan lifecycle
  phase: ScanPhase;
  sessionId: string | null;
  error: string | null;

  // Actions
  setEntryData: (data: { age: number; sex: UserSex; heightCm: number }) => void;
  setPhase: (phase: ScanPhase) => void;
  setSessionId: (id: string | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  age: null,
  sex: null,
  heightCm: null,
  phase: "idle" as ScanPhase,
  sessionId: null,
  error: null,
};

export const useScanStore = create<ScanState>((set) => ({
  ...initialState,

  setEntryData: (data) =>
    set({ age: data.age, sex: data.sex, heightCm: data.heightCm, error: null }),

  setPhase: (phase) => set({ phase }),

  setSessionId: (sessionId) => set({ sessionId }),

  setError: (error) => set({ error }),

  reset: () => set({ ...initialState }),
}));
