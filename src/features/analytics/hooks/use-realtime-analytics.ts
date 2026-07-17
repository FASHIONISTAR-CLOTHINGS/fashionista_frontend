/**
 * features/analytics/hooks/use-realtime-analytics.ts
 *
 * WebSocket hook for real-time analytics streaming.
 * Connects to ws://host/ws/analytics/realtime/ with auto-reconnect
 * and exponential backoff. Events are buffered in the Zustand store.
 */

"use client";

import { useEffect, useRef, useCallback } from "react";
import { getClientWsBaseUrl } from "@/core/config/api-roots";
import { readAccessToken } from "@/features/auth/lib/auth-session.client";
import { useRealtimeStore } from "../stores/realtime-store";
import type { AnalyticsWSEvent } from "../types";

const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30_000;
const PING_INTERVAL_MS = 30_000;

function buildWsUrl(): string {
  return `${getClientWsBaseUrl()}/analytics/realtime/`;
}

export function useRealtimeAnalytics() {
  const addEvent = useRealtimeStore((s) => s.addEvent);
  const setConnected = useRealtimeStore((s) => s.setConnected);
  const clearEvents = useRealtimeStore((s) => s.clearEvents);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempt = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const shouldReconnect = useRef(true);
  const connectRef = useRef<() => void>(() => {});

  const connect = useCallback(() => {
    if (!shouldReconnect.current) return;
    if (typeof window === "undefined") return;

    const url = buildWsUrl();
    const token = readAccessToken();
    const subprotocols = token ? [`bearer.${token}`] : undefined;

    const ws = new WebSocket(url, subprotocols);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectAttempt.current = 0;
      setConnected(true);

      pingTimer.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping", timestamp: Date.now() }));
        }
      }, PING_INTERVAL_MS);
    };

    ws.onmessage = (event) => {
      try {
        const parsed: AnalyticsWSEvent = JSON.parse(event.data);
        addEvent(parsed);
      } catch {
        // Non-JSON message — ignore
      }
    };

    ws.onerror = () => {
      setConnected(false);
    };

    ws.onclose = () => {
      setConnected(false);
      if (pingTimer.current) {
        clearInterval(pingTimer.current);
        pingTimer.current = null;
      }

      if (shouldReconnect.current) {
        const delay = Math.min(
          RECONNECT_BASE_MS * 2 ** reconnectAttempt.current,
          RECONNECT_MAX_MS,
        );
        reconnectAttempt.current++;
        reconnectTimer.current = setTimeout(() => connectRef.current(), delay);
      }
    };
  }, [addEvent, setConnected]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    shouldReconnect.current = true;
    connectRef.current();

    return () => {
      shouldReconnect.current = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (pingTimer.current) clearInterval(pingTimer.current);
      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmounting");
        wsRef.current = null;
      }
      setConnected(false);
      clearEvents();
    };
  }, [connect, setConnected, clearEvents]);

  return {
    events: useRealtimeStore((s) => s.events),
    isConnected: useRealtimeStore((s) => s.isConnected),
    lastEventAt: useRealtimeStore((s) => s.lastEventAt),
  };
}
