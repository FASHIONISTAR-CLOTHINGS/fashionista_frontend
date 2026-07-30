"use client";
/**
 * @file useScanWebSocket.ts
 * @description GAP-4 FIX: Real-time scan progress hook via Django Channels WebSocket.
 *
 * Replaces the 2-second polling loop in useScanSession with a WebSocket
 * connection to ws://<api>/ws/scan/<session_id>/?token=<JWT>.
 *
 * Events received from the backend:
 *   status_snapshot     — sent immediately on connect (current DB state)
 *   processing_started  — Celery task started
 *   landmarks_validated — pose quality passed
 *   measurements_extracted — geometry pipeline complete
 *   profile_saved       — MeasurementProfile created
 *   completed           — everything done; measurements_cm is populated
 *   failed              — processing failed; error_message is set
 *
 * Fallback strategy:
 *   If the WebSocket fails to connect (network error, server not ready) the
 *   hook exposes `isWebSocketError` so the caller can fall back to polling.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import type { ScanStatusResponse } from "../api/scan.api";
import { normalizeScanMeasurements } from "../api/scan.api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScanWsEvent {
  event:      string;
  session_id: string;
  status:     ScanStatusResponse["status"];
  data: {
    quality_score?:         number | null;
    measurements_cm?:       Record<string, number | null> | null;
    plausibility_warnings?: string[];
    correction_applied?:    string;
    bmi?:                   number | null;
    profile_id?:            string | null;
    error_message?:         string | null;
  };
}

interface UseScanWebSocketOptions {
  /** JWT access token for ?token= query param */
  accessToken: string | null;
  /** Callback fired on every status event */
  onStatusUpdate?: (status: ScanStatusResponse) => void;
  /** Callback fired when status transitions to "completed" */
  onCompleted?:    (status: ScanStatusResponse) => void;
  /** Callback fired when status transitions to "failed" */
  onFailed?:       (errorMessage: string) => void;
}

interface UseScanWebSocketReturn {
  /** Last received status from WebSocket (or null if not yet received) */
  status:           ScanStatusResponse | null;
  isConnected:      boolean;
  isWebSocketError: boolean;
  /** Call to close the WebSocket (e.g. on component unmount or scan complete) */
  disconnect:       () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8001";
const WS_BASE_URL =
  (process.env.NEXT_PUBLIC_WS_URL ?? BACKEND_URL)
    .replace(/^http(s?)/, "ws$1")
    .replace(/\/$/, "");

const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY_MS     = 2_000;

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useScanWebSocket(
  sessionId: string | null,
  options: UseScanWebSocketOptions
): UseScanWebSocketReturn {
  const { accessToken, onStatusUpdate, onCompleted, onFailed } = options;

  const [status,           setStatus]           = useState<ScanStatusResponse | null>(null);
  const [isConnected,      setIsConnected]       = useState(false);
  const [isWebSocketError, setIsWebSocketError]  = useState(false);

  const wsRef              = useRef<WebSocket | null>(null);
  const reconnectAttempts  = useRef(0);
  const isMountedRef       = useRef(true);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close(1000, "client_disconnect");
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!sessionId || !accessToken) return;

    const url = `${WS_BASE_URL}/ws/scan/${sessionId}/?token=${encodeURIComponent(accessToken)}`;

    function connect() {
      if (!isMountedRef.current) return;

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMountedRef.current) { ws.close(); return; }
        reconnectAttempts.current = 0;
        setIsConnected(true);
        setIsWebSocketError(false);
      };

      ws.onmessage = (event) => {
        if (!isMountedRef.current) return;
        try {
          const msg: ScanWsEvent = JSON.parse(event.data as string);

          // Build a ScanStatusResponse from the WS event
          const normalizedMeasurements = normalizeScanMeasurements(
            (msg.data.measurements_cm ?? undefined) as Record<string, number | null> | undefined
          );

          const updatedStatus: ScanStatusResponse = {
            session_id:            msg.session_id,
            status:                msg.status ?? "processing",
            scan_confidence:       msg.data.quality_score ?? undefined,
            measurements_cm:       normalizedMeasurements,
            extracted_measurements: normalizedMeasurements,
            plausibility_warnings: msg.data.plausibility_warnings ?? [],
            correction_applied:    msg.data.correction_applied,
            bmi:                   msg.data.bmi ?? undefined,
            error_message:         msg.data.error_message ?? undefined,
            measurement_profile_id: msg.data.profile_id ?? undefined,
          };

          setStatus(updatedStatus);
          onStatusUpdate?.(updatedStatus);

          if (msg.status === "completed" || msg.event === "completed") {
            onCompleted?.(updatedStatus);
            ws.close(1000, "scan_completed");
          }
          if (msg.status === "failed" || msg.event === "failed") {
            onFailed?.(msg.data.error_message ?? "Scan processing failed.");
            ws.close(1000, "scan_failed");
          }
        } catch {
          // Malformed JSON — ignore silently
        }
      };

      ws.onerror = () => {
        if (!isMountedRef.current) return;
        setIsConnected(false);
      };

      ws.onclose = (closeEvent) => {
        if (!isMountedRef.current) return;
        setIsConnected(false);

        // Reconnect unless intentional close (code 1000) or max attempts reached
        if (
          closeEvent.code !== 1000 &&
          reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS
        ) {
          reconnectAttempts.current += 1;
          setTimeout(connect, RECONNECT_DELAY_MS * reconnectAttempts.current);
        } else if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
          setIsWebSocketError(true);
        }
      };
    }

    connect();

    return () => {
      wsRef.current?.close(1000, "component_unmount");
      wsRef.current = null;
    };
  }, [sessionId, accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  return { status, isConnected, isWebSocketError, disconnect };
}
