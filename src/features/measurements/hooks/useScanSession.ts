/**
 * @file useScanSession.ts
 * @description TanStack Query hook for managing the AI body scan session lifecycle.
 *
 * Responsibilities:
 * - Initiate a scan session (POST → DRF)
 * - Submit landmarks (POST → DRF)
 * - Poll session status every 2 seconds (GET → Ninja) until done
 * - Invalidate measurement profiles cache on completion
 *
 * Usage:
 *   const { session, initiate, submit, isPolling } = useScanSession();
 */
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  initiateBodyScan,
  submitLandmarks,
  pollScanStatus,
} from "../api/scan.api";
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
  | "processing"    // Celery task running — polling status
  | "completed"     // Measurements saved
  | "failed";       // Backend error

export interface UseScanSessionReturn {
  /** Current phase of the scan session state machine. */
  phase: ScanPhase;
  /** The active session ID (null before initiation). */
  sessionId: string | null;
  /** Full status response from the Ninja polling endpoint. */
  sessionStatus: ScanStatusResponse | null;
  /** True while polling for status (Celery processing). */
  isPolling: boolean;
  /** Error message if any step failed. */
  error: string | null;
  /**
   * Step 1: Create a new scan session.
   * Returns the session_id string.
   */
  initiate: (deviceType?: "web" | "ios" | "android") => Promise<string | null>;
  /**
   * Step 2: Submit MediaPipe landmarks to the backend.
   * Starts Celery processing and begins polling.
   */
  submit: (payload: LandmarkSubmitPayload) => Promise<void>;
  /** Reset state — allows starting a new scan. */
  reset: () => void;
  /** T-031: Retry the last failed submission. */
  retry: () => void;
  /** T-030: Whether the browser is currently offline. */
  isOffline: boolean;
  /** T-033: Whether the processing timeout has been reached. */
  isTimedOut: boolean;
  /** Adopt an existing session ID without calling initiate(). */
  setExistingSession: (sessionId: string) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useScanSession(): UseScanSessionReturn {
  const qc = useQueryClient();

  const [phase, setPhase]         = useState<ScanPhase>("idle");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const pollingEnabled = phase === "processing";

  // T-030: Track online/offline status
  useEffect(() => {
    const updateOnline = () => setIsOffline(!navigator.onLine);
    updateOnline();
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);

  // T-031: Store last payload for retry
  const lastPayloadRef = useRef<LandmarkSubmitPayload | null>(null);

  // T-033: Processing timeout (60 seconds)
  const processingStartRef = useRef<number | null>(null);
  const PROCESSING_TIMEOUT_MS = 60_000;

  useEffect(() => {
    if (phase === "processing") {
      processingStartRef.current = Date.now();
      const timer = setTimeout(() => {
        if (phase === "processing") {
          setIsTimedOut(true);
          setPhase("failed");
          setError("Processing timed out. The AI server may be overloaded. Please try again.");
          toast.error("Scan processing timed out. Please try again.");
        }
      }, PROCESSING_TIMEOUT_MS);
      return () => clearTimeout(timer);
    }
    processingStartRef.current = null;
    return undefined;
  }, [phase]);

  // ── Ninja polling query ─────────────────────────────────────────────────────
  const { data: sessionStatus } = useQuery<ScanStatusResponse>({
    queryKey: ["scan-session", sessionId],
    queryFn:  () => pollScanStatus(sessionId!),
    enabled:  Boolean(sessionId) && pollingEnabled,
    refetchInterval: 2000,       // Poll every 2 seconds
    staleTime: 0,
    retry: false,
    // Stop polling once status is terminal
    refetchIntervalInBackground: false,
    select: (data) => {
      if (data.status === "completed" || data.status === "failed") {
        // Will trigger the onSuccess side-effect below
        return data;
      }
      return data;
    },
  });

  // Watch for terminal status transitions
  const prevStatusRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!sessionStatus) return;
    if (sessionStatus.status === prevStatusRef.current) return;
    prevStatusRef.current = sessionStatus.status;

    if (sessionStatus.status === "completed" && phase === "processing") {
      // Transition to completed — setState is reacting to external query data change
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("completed");
      // Invalidate measurement profiles so the new profile appears immediately
      void qc.invalidateQueries({ queryKey: measurementKeys.all });
      toast.success("Body measurements captured successfully! 🎉");
    } else if (sessionStatus.status === "failed" && phase === "processing") {
      setPhase("failed");
      setError(sessionStatus.error_message ?? "Scan processing failed.");
      toast.error(
        sessionStatus.error_message ?? "Scan failed. Please try again."
      );
    }
  }, [sessionStatus, phase, qc]);

  // ── Initiate scan session ───────────────────────────────────────────────────
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

  // ── Submit landmarks ────────────────────────────────────────────────────────
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

      // T-030: Offline check — buffer the payload for when connection returns
      if (!navigator.onLine) {
        lastPayloadRef.current = payload;
        setError("You are offline. Your scan will be submitted automatically when connection returns.");
        toast.warning("Offline — scan queued for submission.");
        return;
      }

      lastPayloadRef.current = payload;
      setPhase("submitting");
      setError(null);

      try {
        await submitLandmarks(sessionId, payload);
        // Backend returns 202 Accepted — Celery task now running
        setPhase("processing");
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

  // T-031: Retry the last failed submission
  const retry = useCallback(async () => {
    if (!lastPayloadRef.current || !sessionId) {
      toast.error("No previous scan data to retry.");
      return;
    }
    setPhase("ready");
    setError(null);
    setIsTimedOut(false);
    // Small delay to allow phase transition to render
    setTimeout(() => {
      void submit(lastPayloadRef.current!);
    }, 100);
  }, [sessionId, submit]);

  // T-030: Auto-submit when connection returns if we have a buffered payload
  useEffect(() => {
    if (!isOffline && lastPayloadRef.current && phase === "failed" && sessionId) {
      const wasOfflineError = error?.includes("offline");
      if (wasOfflineError) {
        toast.info("Connection restored — submitting scan...");
        void retry();
      }
    }
  }, [isOffline, phase, error, sessionId, retry]);

  // ── Reset ───────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setPhase("idle");
    setSessionId(null);
    setError(null);
    setIsTimedOut(false);
    lastPayloadRef.current = null;
    prevStatusRef.current = undefined;
  }, []);

  // ── Adopt an existing session (e.g. from URL or QR code) ─────────────────────
  const setExistingSession = useCallback((sid: string) => {
    setSessionId(sid);
    setPhase("ready");
    setError(null);
    prevStatusRef.current = undefined;
  }, []);

  return {
    phase,
    sessionId,
    sessionStatus: sessionStatus ?? null,
    isPolling:     pollingEnabled,
    error,
    isOffline,
    isTimedOut,
    initiate,
    submit,
    retry,
    reset,
    setExistingSession,
  };
}
