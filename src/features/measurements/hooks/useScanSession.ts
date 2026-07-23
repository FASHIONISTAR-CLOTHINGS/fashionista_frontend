/**
 * @file useScanSession.ts
 * @description TanStack Query hook for managing the AI body scan session lifecycle.
 *
 * Responsibilities:
 * - Initiate a scan session (POST → DRF)
 * - Submit landmarks (POST → DRF)
 * - Receive real-time status via Django Channels WebSocket (primary)
 * - Fall back to 2-second polling if WebSocket fails (isWebSocketError)
 * - Invalidate measurement profiles cache on completion
 *
 * Usage:
 *   const { session, initiate, submit, isPolling } = useScanSession();
 */
"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  initiateBodyScan,
  submitLandmarks,
  pollScanStatus,
} from "../api/scan.api";
import { useScanWebSocket } from "./useScanWebSocket";
import { measurementKeys } from "./use-measurements";
import type {
  LandmarkSubmitPayload,
  ScanSessionResponse,
  ScanStatusResponse,
} from "../api/scan.api";

// ─── Hook state ───────────────────────────────────────────────────────────────

export type ScanPhase =
  | "idle"          // No session
  | "initiating"    // POST /initiate/ in progress
  | "ready"         // Session created — waiting for landmarks
  | "submitting"    // POST /submit-landmarks/ in progress
  | "processing"    // Celery task running — receiving progress
  | "completed"     // Measurements saved
  | "failed";       // Backend error

export interface UseScanSessionReturn {
  /** Current phase of the scan session state machine. */
  phase: ScanPhase;
  /** The active session ID (null before initiation). */
  sessionId: string | null;
  /** Full status response from the Ninja polling endpoint or WebSocket. */
  sessionStatus: ScanStatusResponse | null;
  /** True while processing scan (WebSocket connected or polling). */
  isPolling: boolean;
  /** True while the WebSocket is connected and receiving events. */
  isWebSocketConnected: boolean;
  /** Error message if any step failed. */
  error: string | null;
  /**
   * Step 1: Create a new scan session.
   * Returns the session_id string.
   */
  initiate: (deviceType?: "web" | "ios" | "android") => Promise<string | null>;
  /**
   * Step 2: Submit MediaPipe landmarks to the backend.
   * Starts Celery processing and begins WebSocket / polling.
   */
  submit: (payload: LandmarkSubmitPayload) => Promise<void>;
  /** Reset state — allows starting a new scan. */
  reset: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** JWT access token source — reads from localStorage (set by auth store). */
function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    // Auth store persists to "fashionistar-auth-storage" per auth.store.ts
    const raw = localStorage.getItem("fashionistar-auth-storage");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { access?: string } };
    return parsed?.state?.access ?? null;
  } catch {
    return null;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useScanSession(): UseScanSessionReturn {
  const qc = useQueryClient();

  const [manualPhase, setManualPhase] = useState<ScanPhase>("idle");
  const [sessionId, setSessionId]     = useState<string | null>(null);
  const [manualError, setManualError] = useState<string | null>(null);

  const pollingEnabled = manualPhase === "processing";
  const accessToken    = getAccessToken();

  // Track the last status we toasted/invalidated for to avoid duplicates
  const prevStatusRef = useRef<string | undefined>(undefined);

  // ── D-2: WebSocket real-time progress ─────────────────────────────────────

  const {
    status:           wsStatus,
    isConnected:      isWebSocketConnected,
    isWebSocketError: wsError,
  } = useScanWebSocket(pollingEnabled ? sessionId : null, { accessToken });

  // ── Polling fallback (only when WebSocket is unavailable) ─────────────────

  const useFallbackPolling = pollingEnabled && wsError;

  const { data: polledStatus } = useQuery<ScanStatusResponse>({
    queryKey:  ["scan-session-poll", sessionId],
    queryFn:   () => pollScanStatus(sessionId!),
    enabled:   Boolean(sessionId) && useFallbackPolling,
    refetchInterval: 2000,
    staleTime: 0,
    retry:     false,
    refetchIntervalInBackground: false,
  });

  // Active session status: prefer WebSocket, fall back to polling
  const sessionStatus = wsStatus ?? polledStatus ?? null;

  // ── Derive public phase/error from manual state + external status ─────────

  const phase = useMemo<ScanPhase>(() => {
    if (sessionStatus?.status === "completed") return "completed";
    if (sessionStatus?.status === "failed")    return "failed";
    return manualPhase;
  }, [sessionStatus, manualPhase]);

  const error = useMemo<string | null>(() => {
    if (sessionStatus?.status === "failed") {
      return sessionStatus.error_message ?? "Scan failed.";
    }
    return manualError;
  }, [sessionStatus, manualError]);

  // Notify + invalidate cache when external status reaches a terminal state
  useEffect(() => {
    const status = sessionStatus?.status;
    if (!status || status === prevStatusRef.current) return;
    prevStatusRef.current = status;

    if (status === "completed") {
      void qc.invalidateQueries({ queryKey: measurementKeys.all });
      toast.success("Body measurements captured successfully! 🎉");
    } else if (status === "failed") {
      toast.error(sessionStatus?.error_message ?? "Scan failed. Please try again.");
    }
  }, [sessionStatus, qc]);

  // ── Initiate scan session ────────────────────────────────────────────────

  const initiate = useCallback(
    async (deviceType: "web" | "ios" | "android" = "web"): Promise<string | null> => {
      if (manualPhase !== "idle") {
        console.warn("[useScanSession] initiate() called in non-idle phase:", manualPhase);
        return sessionId;
      }

      setManualPhase("initiating");
      setManualError(null);

      try {
        const response: ScanSessionResponse = await initiateBodyScan({ device_type: deviceType });
        const sid = response.session_id;
        setSessionId(sid);
        setManualPhase("ready");
        return sid;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to start scan session.";
        setManualError(msg);
        setManualPhase("failed");
        toast.error(msg);
        return null;
      }
    },
    [manualPhase, sessionId]
  );

  // ── Submit landmarks ─────────────────────────────────────────────────────

  const submit = useCallback(
    async (payload: LandmarkSubmitPayload): Promise<void> => {
      if (!sessionId) {
        toast.error("No active scan session. Please start a new scan.");
        return;
      }
      if (manualPhase !== "ready") {
        console.warn("[useScanSession] submit() called in unexpected phase:", manualPhase);
        return;
      }

      setManualPhase("submitting");
      setManualError(null);

      try {
        await submitLandmarks(sessionId, payload);
        // Backend returns 202 Accepted — WebSocket or Celery polling begins
        setManualPhase("processing");
        prevStatusRef.current = undefined; // reset for fresh transition detection
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to submit scan data.";
        setManualError(msg);
        setManualPhase("failed");
        toast.error(msg);
      }
    },
    [sessionId, manualPhase]
  );

  // ── Reset ────────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    setManualPhase("idle");
    setSessionId(null);
    setManualError(null);
    prevStatusRef.current = undefined;
  }, []);

  return {
    phase,
    sessionId,
    sessionStatus,
    isPolling:           pollingEnabled,
    isWebSocketConnected,
    error,
    initiate,
    submit,
    reset,
  };
}
