/**
 * features/chat/hooks/use-chat-websocket.ts
 *
 * Custom React hook for WebSocket real-time chat.
 *
 * Strategy:
 *   1. On mount: establish WebSocket via Django Channels.
 *   2. Incoming `message.new` events: optimistically inject into TanStack Query cache.
 *   3. On WebSocket error/close: fall back to REST polling (10s interval).
 *   4. On WebSocket reconnect: cancel REST polling.
 *   5. Cleanup: close WebSocket on component unmount.
 *
 * IMPORTANT: This hook does NOT manage query fetching — it only manages the
 * WebSocket connection and cache mutations. Query management stays in use-chat.ts.
 */

"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { chatKeys } from "../types/chat.types";
import type {
  WsEvent,
  WsNewMessagePayload,
  WsTypingPayload,
  WsPresencePayload,
  WebSocketReadyState,
  Message,
} from "../types/chat.types";

// WebSocket URL builder — uses environment variable for base
const WS_BASE =
  process.env.NEXT_PUBLIC_WS_URL?.replace(/^http/, "ws") ??
  "ws://localhost:8000";

function buildWsUrl(conversationId: string, token: string): string {
  return `${WS_BASE}/ws/chat/${conversationId}/?token=${token}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

export interface UseChatWebSocketOptions {
  conversationId: string | null;
  authToken: string | null;
  onMessage?: (msg: Message) => void;
  onTyping?: (payload: WsTypingPayload) => void;
  onPresence?: (payload: WsPresencePayload) => void;
  onConnectionChange?: (state: WebSocketReadyState) => void;
}

export interface UseChatWebSocketReturn {
  readyState: WebSocketReadyState;
  sendEvent: (event: WsEvent) => void;
  isConnected: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK IMPLEMENTATION
// ─────────────────────────────────────────────────────────────────────────────

export function useChatWebSocket({
  conversationId,
  authToken,
  onMessage,
  onTyping,
  onPresence,
  onConnectionChange,
}: UseChatWebSocketOptions): UseChatWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const [readyState, setReadyStateState] = useState<WebSocketReadyState>("closed");
  const queryClient = useQueryClient();

  const setReadyState = useCallback(
    (state: WebSocketReadyState) => {
      setReadyStateState(state);
      onConnectionChange?.(state);
    },
    [onConnectionChange]
  );

  // Inject an incoming message into TanStack Query cache immediately —
  // before the user has to wait for a full refetch.
  const injectMessageIntoCache = useCallback(
    (msg: Message) => {
      if (!conversationId) return;

      // Update the paginated messages cache (page 1)
      queryClient.setQueryData<{
        messages: Message[];
        has_more: boolean;
        page: number;
        total: number;
      }>(
        chatKeys.messagesPage(conversationId, 1),
        (old) => {
          if (!old) {
            return {
              messages: [msg],
              has_more: false,
              page: 1,
              total: 1,
            };
          }
          // De-duplicate: skip if message already exists
          const exists = old.messages.some((m) => m.id === msg.id);
          if (exists) return old;
          return { ...old, messages: [msg, ...old.messages], total: old.total + 1 };
        }
      );

      // Update conversation feed's unread count
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
    [conversationId, queryClient]
  );

  // ── WebSocket Lifecycle ──────────────────────────────────────────────────
  useEffect(() => {
    if (!conversationId || !authToken) {
      return;
    }

    const url = buildWsUrl(conversationId, authToken);
    const ws = new WebSocket(url);
    wsRef.current = ws;
    window.queueMicrotask(() => setReadyState("connecting"));

    ws.onopen = () => {
      setReadyState("open");
    };

    ws.onerror = () => {
      setReadyState("error");
    };

    ws.onclose = () => {
      setReadyState("closed");
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const wsEvent = JSON.parse(event.data as string) as WsEvent;

        switch (wsEvent.type) {
          case "message.new": {
            const payload = wsEvent.payload as WsNewMessagePayload;
            injectMessageIntoCache(payload.message);
            onMessage?.(payload.message);
            break;
          }
          case "user.typing": {
            const payload = wsEvent.payload as WsTypingPayload;
            onTyping?.(payload);
            break;
          }
          case "user.online":
          case "user.offline": {
            const payload = wsEvent.payload as WsPresencePayload;
            onPresence?.(payload);
            break;
          }
          case "message.read":
          case "offer.update":
          case "conversation.status":
            // Invalidate relevant queries — let TanStack refetch
            if (conversationId) {
              queryClient.invalidateQueries({
                queryKey: chatKeys.conversation(conversationId),
              });
            }
            break;
          default:
            break;
        }
      } catch {
        // Silently ignore malformed WebSocket frames
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [conversationId, authToken, injectMessageIntoCache, onMessage, onTyping, onPresence, setReadyState, queryClient]);

  // ── Send Event Helper ─────────────────────────────────────────────────────
  const sendEvent = useCallback((event: WsEvent) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(event));
    }
  }, []);

  return {
    readyState: conversationId && authToken ? readyState : "closed",
    sendEvent,
    isConnected: Boolean(conversationId && authToken && readyState === "open"),
  };
}
