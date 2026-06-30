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

import { useState, useCallback, useRef } from "react";
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
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useScanSession(): UseScanSessionReturn {
  const qc = useQueryClient();

  const [phase, setPhase]         = useState<ScanPhase>("idle");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const pollingEnabled = phase === "processing";

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
  if (
    sessionStatus &&
    sessionStatus.status !== prevStatusRef.current
  ) {
    prevStatusRef.current = sessionStatus.status;

    if (sessionStatus.status === "completed" && phase === "processing") {
      // Transition to completed
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
  }

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

  // ── Reset ───────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setPhase("idle");
    setSessionId(null);
    setError(null);
    prevStatusRef.current = undefined;
  }, []);

  return {
    phase,
    sessionId,
    sessionStatus: sessionStatus ?? null,
    isPolling:     pollingEnabled,
    error,
    initiate,
    submit,
    reset,
  };
}
