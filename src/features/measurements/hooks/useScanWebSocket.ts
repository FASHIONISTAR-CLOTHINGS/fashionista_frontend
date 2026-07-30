"use client";
/**
 * @file useScanWebSocket.ts
 * @description T-032: WebSocket hook for real-time scan progress updates.
 *
 * Features:
 * - Auto-reconnect with exponential backoff (max 5 attempts)
 * - Connection status tracking
 * - Scan phase event forwarding
 * - Graceful fallback to polling when WS fails
 *
 * Usage:
 *   const { isConnected, scanPhase, lastEvent, reconnect } = useScanWebSocket(sessionId);
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { readAccessToken } from "@/features/auth/lib/auth-session.client";

export type WSConnectionStatus = "idle" | "connecting" | "connected" | "disconnected" | "error";

export interface ScanWSEvent {
  event: string;
  session_id: string;
  status: string;
  scan_phase: string | null;
  data: Record<string, unknown>;
}

const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 16000;

function getWsBaseUrl(): string {
  if (typeof window === "undefined") return "";
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const apiRoot = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "";
  if (apiRoot) {
    try {
      const url = new URL(apiRoot);
      return `${url.protocol === "https:" ? "wss:" : "ws:"}//${url.host}`;
    } catch {
      // fall through
    }
  }
  return `${protocol}//${window.location.host}`;
}

export function useScanWebSocket(sessionId: string | null) {
  const [connectionStatus, setConnectionStatus] = useState<WSConnectionStatus>("idle");
  const [lastEvent, setLastEvent] = useState<ScanWSEvent | null>(null);
  const [scanPhase, setScanPhase] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const connect = useCallback((sid: string) => {
    if (!sid || typeof window === "undefined") return;

    const wsBase = getWsBaseUrl();
    if (!wsBase) return;

    // Build WebSocket URL with JWT token for authentication
    // Backend JWTQueryAuthMiddleware requires ?token=<access_token> query param
    let wsUrl = `${wsBase}/ws/scan/${sid}/`;
    try {
      const token = readAccessToken();
      if (token) {
        wsUrl += `?token=${encodeURIComponent(token)}`;
      }
    } catch {
      // token not available — connect without token (will fail with 403 but won't crash)
    }

    setConnectionStatus("connecting");

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        setConnectionStatus("connected");
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (ev: MessageEvent) => {
        if (!mountedRef.current) return;
        try {
          const data: ScanWSEvent = JSON.parse(ev.data);
          setLastEvent(data);
          if (data.scan_phase) {
            setScanPhase(data.scan_phase);
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onerror = () => {
        if (!mountedRef.current) return;
        setConnectionStatus("error");
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        setConnectionStatus("disconnected");

        // Auto-reconnect with exponential backoff
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          const attempt = reconnectAttemptsRef.current;
          const backoff = Math.min(
            INITIAL_BACKOFF_MS * Math.pow(2, attempt),
            MAX_BACKOFF_MS
          );
          reconnectAttemptsRef.current += 1;

          reconnectTimerRef.current = setTimeout(() => {
            if (mountedRef.current && sid) {
              connect(sid);
            }
          }, backoff);
        }
      };
    } catch {
      setConnectionStatus("error");
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    reconnectAttemptsRef.current = 0;
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnectionStatus("idle");
    setScanPhase(null);
    setLastEvent(null);
  }, []);

  const reconnect = useCallback(() => {
    if (sessionId) {
      reconnectAttemptsRef.current = 0;
      connect(sessionId);
    }
  }, [sessionId, connect]);

  // Connect when sessionId is provided
  useEffect(() => {
    mountedRef.current = true;
    if (sessionId) {
      connect(sessionId);
    }
    return () => {
      mountedRef.current = false;
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return {
    connectionStatus,
    isConnected: connectionStatus === "connected",
    lastEvent,
    scanPhase,
    reconnect,
    disconnect,
  };
}
