/**
 * @file useScanSessionStore.ts
 * @description TASK-063: Zustand store for scan session persistence.
 *
 * Persists QR code data + session metadata in memory so:
 *   1. QR gateway page re-renders don't need to re-initiate
 *   2. The session_id, measurement_url, and qr_code_b64 survive navigation
 *      within the dashboard (client-side only — not SSR)
 *
 * NOT persisted to localStorage: qr_code_b64 is a large base64 string.
 * Session data is cleared when the user navigates away from the scan flow
 * or when a new session is initiated (clearSession action).
 *
 * Part of the FASHIONISTAR State Management Trinity:
 *   - TanStack Query (server state)    ← scan status polling
 *   - Zustand (client state)           ← QR session data (this store)
 *   - Nuqs (URL state)                 ← search params
 */
"use client";

import { create } from "zustand";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ScanSessionStoreData {
  /** The BodyScanSession UUID */
  sessionId:       string | null;
  /** Full frontend scan URL — used in QR code */
  measurementUrl:  string;
  /** Base64 PNG QR code for immediate display */
  qrCodeB64:       string;
  /** Cloudinary URL of persisted QR PNG (populated async) */
  qrCodeUrl:       string;
  /** Unix timestamp (ms) when session was initiated */
  initiatedAt:     number | null;
  /** Device type at time of initiation */
  deviceType:      "ios" | "android" | "web" | null;
}

interface ScanSessionStoreActions {
  /**
   * Set the active scan session data after a successful initiate call.
   */
  setSession: (data: {
    sessionId:      string;
    measurementUrl: string;
    qrCodeB64:      string;
    qrCodeUrl:      string;
    deviceType:     "ios" | "android" | "web";
  }) => void;
  /** Update qr_code_url when Cloudinary upload completes (if polled). */
  setQrCodeUrl: (url: string) => void;
  /** Clear all session data (on cancel, completion, or new scan). */
  clearSession: () => void;
}

export type ScanSessionStore = ScanSessionStoreData & ScanSessionStoreActions;

// ─── Initial state ─────────────────────────────────────────────────────────────

const initialState: ScanSessionStoreData = {
  sessionId:      null,
  measurementUrl: "",
  qrCodeB64:      "",
  qrCodeUrl:      "",
  initiatedAt:    null,
  deviceType:     null,
};

// ─── Store ─────────────────────────────────────────────────────────────────────

export const useScanSessionStore = create<ScanSessionStore>((set) => ({
  ...initialState,

  setSession: ({ sessionId, measurementUrl, qrCodeB64, qrCodeUrl, deviceType }) => {
    set({
      sessionId,
      measurementUrl,
      qrCodeB64,
      qrCodeUrl,
      initiatedAt: Date.now(),
      deviceType,
    });
  },

  setQrCodeUrl: (url) => {
    set({ qrCodeUrl: url });
  },

  clearSession: () => {
    set(initialState);
  },
}));

// ─── Selectors (for performance — avoid re-render on unrelated changes) ────────

export const selectSessionId      = (s: ScanSessionStore) => s.sessionId;
export const selectMeasurementUrl = (s: ScanSessionStore) => s.measurementUrl;
export const selectQrCodeB64      = (s: ScanSessionStore) => s.qrCodeB64;
export const selectQrCodeUrl      = (s: ScanSessionStore) => s.qrCodeUrl;
export const selectDeviceType     = (s: ScanSessionStore) => s.deviceType;
export const selectIsSessionActive= (s: ScanSessionStore) =>
  s.sessionId !== null && s.initiatedAt !== null;
