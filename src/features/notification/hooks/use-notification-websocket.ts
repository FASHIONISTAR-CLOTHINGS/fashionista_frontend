/**
 * Real-time unread badge updates for the notification slice.
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { readAccessToken } from "@/features/auth/lib/auth-session.client";

const WS_BASE =
  process.env.NEXT_PUBLIC_WS_URL?.replace(/^http/, "ws") ??
  "ws://localhost:8000";

function buildNotificationWsUrl(token: string): string {
  return `${WS_BASE}/ws/notifications/?token=${token}`;
}

export interface UseNotificationWebSocketReturn {
  isConnected: boolean;
}

export function useNotificationWebSocket(): UseNotificationWebSocketReturn {
  const queryClient = useQueryClient();
  const token = useMemo(() => readAccessToken(), []);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    const socket = new WebSocket(buildNotificationWsUrl(token));

    socket.onopen = () => setIsConnected(true);
    socket.onerror = () => setIsConnected(false);
    socket.onclose = () => setIsConnected(false);
    socket.onmessage = (event) => {
      try {
        const frame = JSON.parse(event.data as string) as {
          type?: string;
          payload?: { unread_count?: number };
        };
        if (frame.type !== "notification.badge") {
          return;
        }
        queryClient.setQueryData(
          ["notification", "badge-count"],
          frame.payload?.unread_count ?? 0,
        );
      } catch {
        // Ignore malformed frames and keep the socket alive.
      }
    };

    return () => socket.close();
  }, [queryClient, token]);

  return { isConnected: Boolean(token && isConnected) };
}
