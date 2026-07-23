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

import { useState, useCallback, useRef } from "react";
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

  const [phase, setPhase]         = useState<ScanPhase>("idle");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError]         = useState<string | null>(null);

  const pollingEnabled  = phase === "processing";
  const accessToken     = getAccessToken();

  // ── Shared completion handler ─────────────────────────────────────────────

  const prevStatusRef = useRef<string | undefined>(undefined);

  const handleStatusUpdate = useCallback(
    (data: ScanStatusResponse) => {
      if (data.status === prevStatusRef.current) return;
      prevStatusRef.current = data.status;

      if (data.status === "completed" && phase === "processing") {
        setPhase("completed");
        void qc.invalidateQueries({ queryKey: measurementKeys.all });
        toast.success("Body measurements captured successfully! 🎉");
      } else if (data.status === "failed" && phase === "processing") {
        setPhase("failed");
        setError(data.error_message ?? "Scan processing failed.");
        toast.error(data.error_message ?? "Scan failed. Please try again.");
      }
    },
    [phase, qc]
  );

  // ── D-2: WebSocket real-time progress ─────────────────────────────────────

  const {
    status:           wsStatus,
    isConnected:      isWebSocketConnected,
    isWebSocketError: wsError,
  } = useScanWebSocket(pollingEnabled ? sessionId : null, {
    accessToken,
    onStatusUpdate: handleStatusUpdate,
    onCompleted:    handleStatusUpdate,
    onFailed: (msg) => {
      if (phase === "processing") {
        setPhase("failed");
        setError(msg);
        toast.error(msg);
      }
    },
  });

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

  // Apply polled status updates through the shared handler
  useEffect(() => {
    if (polledStatus && useFallbackPolling) {
      handleStatusUpdate(polledStatus);
    }
  }, [polledStatus, useFallbackPolling, handleStatusUpdate]);

  // Active session status: prefer WebSocket, fall back to polling
  const sessionStatus = wsStatus ?? polledStatus ?? null;

  // ── Initiate scan session ────────────────────────────────────────────────

  const initiate = useCallback(
    async (deviceType: "web" | "ios" | "android" = "web"): Promise<string | null> => {
      if (phase !== "idle") {
        console.warn("[useScanSession] initiate() called in non-idle phase:", phase);
        return sessionId;
      }

      setPhase("initiating");
      setError(null);

      try {
        const response: ScanSessionResponse = await initiateBodyScan({ device_type: deviceType });
        const sid = response.session_id;
        setSessionId(sid);
        setPhase("ready");
        return sid;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to start scan session.";
        setError(msg);
        setPhase("failed");
        toast.error(msg);
        return null;
      }
    },
    [phase, sessionId]
  );

  // ── Submit landmarks ─────────────────────────────────────────────────────

  const submit = useCallback(
    async (payload: LandmarkSubmitPayload): Promise<void> => {
      if (!sessionId) {
        toast.error("No active scan session. Please start a new scan.");
        return;
      }
      if (phase !== "ready") {
        console.warn("[useScanSession] submit() called in unexpected phase:", phase);
        return;
      }

      setPhase("submitting");
      setError(null);

      try {
        await submitLandmarks(sessionId, payload);
        // Backend returns 202 Accepted — WebSocket or Celery polling begins
        setPhase("processing");
        prevStatusRef.current = undefined; // reset for fresh transition detection
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to submit scan data.";
        setError(msg);
        setPhase("failed");
        toast.error(msg);
      }
    },
    [sessionId, phase]
  );

  // ── Reset ────────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    setPhase("idle");
    setSessionId(null);
    setError(null);
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
