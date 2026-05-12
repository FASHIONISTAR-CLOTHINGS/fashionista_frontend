/**
 * Real-time unread badge updates for the notification slice.
 *
 * Architecture:
 *   - Token is read reactively from the auth store, NOT snapshotted via useMemo.
 *     This ensures the WebSocket reconnects automatically after:
 *       • Initial auth hydration (Zustand persist rehydration on page load)
 *       • Token refresh
 *       • Login while the page is already open
 *   - Exponential backoff reconnect: 1s → 2s → 4s → 8s → 16s → cap 30s.
 *     Reconnect is attempted only when token is present and socket closed cleanly.
 *   - Ping/pong heartbeat: server sends "ping" every 25s; we reply with "pong".
 *   - useNetworkStatus integration: reconnect is triggered on network recovery.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { useNetworkStatus } from "@/shared";

const WS_BASE =
  process.env.NEXT_PUBLIC_WS_URL?.replace(/^http/, "ws") ??
  "ws://localhost:8000";

const BACKOFF_BASE_MS = 1_000;
const BACKOFF_MAX_MS = 30_000;
const BACKOFF_FACTOR = 2;

function buildNotificationWsUrl(token: string): string {
  return `${WS_BASE}/ws/notifications/?token=${token}`;
}

export interface UseNotificationWebSocketReturn {
  isConnected: boolean;
}

export function useNotificationWebSocket(): UseNotificationWebSocketReturn {
  const queryClient = useQueryClient();
  // Read token reactively from auth store — not useMemo so we respond to hydration.
  const token = useAuthStore((s) => s.accessToken);
  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUnmountedRef = useRef(false);

  // Network recovery — triggers reconnect when coming back online.
  const { wasOffline } = useNetworkStatus();

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current !== null) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (isUnmountedRef.current || !token) return;

    // Close any existing socket cleanly before opening a new one.
    if (socketRef.current && socketRef.current.readyState <= WebSocket.OPEN) {
      socketRef.current.close(1000, "reconnecting");
    }

    const socket = new WebSocket(buildNotificationWsUrl(token));
    socketRef.current = socket;

    socket.onopen = () => {
      if (isUnmountedRef.current) {
        socket.close();
        return;
      }
      setIsConnected(true);
      retryCountRef.current = 0; // Reset backoff on successful connect
    };

    socket.onmessage = (event) => {
      try {
        const frame = JSON.parse(event.data as string) as {
          type?: string;
          payload?: { unread_count?: number };
        };
        // Heartbeat: server sends "ping", we reply "pong"
        if (frame.type === "ping") {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "pong" }));
          }
          return;
        }
        if (frame.type !== "notification.badge") return;
        queryClient.setQueryData(
          ["notification", "badge-count"],
          frame.payload?.unread_count ?? 0,
        );
      } catch {
        // Ignore malformed frames — never close the socket for parse errors.
      }
    };

    socket.onerror = () => {
      setIsConnected(false);
    };

    socket.onclose = (event) => {
      setIsConnected(false);
      if (isUnmountedRef.current || !token) return;
      // 1000 = normal closure (our own reconnect); 4401 = JWT rejected.
      // Do NOT retry on auth rejection or normal self-initiated closes.
      if (event.code === 1000 || event.code === 4401) return;

      // Exponential backoff reconnect
      const delay = Math.min(
        BACKOFF_BASE_MS * Math.pow(BACKOFF_FACTOR, retryCountRef.current),
        BACKOFF_MAX_MS,
      );
      retryCountRef.current += 1;
      retryTimerRef.current = setTimeout(connect, delay);
    };
  }, [token, queryClient]);

  // (Re)connect whenever token changes (login/refresh/hydration)
  useEffect(() => {
    isUnmountedRef.current = false;
    clearRetryTimer();
    retryCountRef.current = 0;
    connect();

    return () => {
      isUnmountedRef.current = true;
      clearRetryTimer();
      if (socketRef.current) {
        socketRef.current.close(1000, "component unmounted");
        socketRef.current = null;
      }
      setIsConnected(false);
    };
  }, [token, connect, clearRetryTimer]);

  // Reconnect on network recovery (wasOffline is true for exactly one render cycle)
  useEffect(() => {
    if (wasOffline && token) {
      clearRetryTimer();
      retryCountRef.current = 0;
      connect();
    }
  }, [wasOffline, token, connect, clearRetryTimer]);

  return { isConnected: Boolean(token && isConnected) };
}
