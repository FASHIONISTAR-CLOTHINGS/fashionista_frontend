/**
 * features/chat/hooks/use-chat-websocket.ts
 *
 * Production-hardened WebSocket hook for the Fashionistar chat domain.
 *
 * Backend contract (apps/chat/consumers.py):
 *   - Auth: token in query string  `?token=<jwt_access_token>`
 *   - Close codes the server sends:
 *       4401  → Unauthenticated (expired/missing JWT)   → do NOT reconnect
 *       4403  → Forbidden (not a conversation participant) → do NOT reconnect
 *       4404  → Conversation not found                  → do NOT reconnect
 *       1001  → Heartbeat timeout (server-initiated)    → reconnect
 *       1011  → Internal error (channel layer failure)  → reconnect
 *   - Server heartbeat:  { type: "ping" }  (every 25s)
 *   - Client must reply: { type: "pong" }  within 30s
 *
 * Reconnection strategy:
 *   - Exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s (cap)
 *   - Max 6 reconnect attempts before giving up
 *   - Disabled for auth/forbidden errors (4401/4403/4404)
 *
 * @module use-chat-websocket
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

// ─── Constants ────────────────────────────────────────────────────────────────

const WS_BASE =
  process.env.NEXT_PUBLIC_WS_URL?.replace(/^http/, "ws") ??
  "ws://localhost:8000";

/** Close codes that indicate a permanent auth/access failure — never reconnect. */
const NON_RECOVERABLE_CODES = new Set([4401, 4403, 4404]);

const MAX_RETRIES = 6;
const BASE_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 30_000;

function buildWsUrl(conversationId: string, token: string): string {
  return `${WS_BASE}/ws/chat/${conversationId}/?token=${encodeURIComponent(token)}`;
}

function getBackoffMs(attempt: number): number {
  return Math.min(BASE_BACKOFF_MS * Math.pow(2, attempt), MAX_BACKOFF_MS);
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface UseChatWebSocketOptions {
  conversationId: string | null;
  authToken: string | null;
  onMessage?: (msg: Message) => void;
  onTyping?: (payload: WsTypingPayload) => void;
  onPresence?: (payload: WsPresencePayload) => void;
  onConnectionChange?: (state: WebSocketReadyState) => void;
  /** Called when connection is permanently lost (auth error or max retries). */
  onFatalError?: (reason: "auth" | "forbidden" | "not_found" | "max_retries") => void;
}

export interface UseChatWebSocketReturn {
  readyState: WebSocketReadyState;
  sendEvent: (event: WsEvent) => void;
  isConnected: boolean;
  /** Reconnect attempts made since last successful open. */
  retryCount: number;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useChatWebSocket({
  conversationId,
  authToken,
  onMessage,
  onTyping,
  onPresence,
  onConnectionChange,
  onFatalError,
}: UseChatWebSocketOptions): UseChatWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);
  const isDestroyedRef = useRef(false);

  const [readyState, setReadyStateRaw] = useState<WebSocketReadyState>("closed");
  const [retryCount, setRetryCount] = useState(0);
  const queryClient = useQueryClient();

  const setReadyState = useCallback(
    (state: WebSocketReadyState) => {
      setReadyStateRaw(state);
      onConnectionChange?.(state);
    },
    [onConnectionChange]
  );

  // ── Optimistic cache injection ─────────────────────────────────────────────
  const injectMessageIntoCache = useCallback(
    (msg: Message) => {
      if (!conversationId) return;

      queryClient.setQueryData<{
        messages: Message[];
        has_more: boolean;
        page: number;
        total: number;
      }>(
        chatKeys.messagesPage(conversationId, 1),
        (old) => {
          if (!old) return { messages: [msg], has_more: false, page: 1, total: 1 };
          const exists = old.messages.some((m) => m.id === msg.id);
          if (exists) return old;
          return { ...old, messages: [msg, ...old.messages], total: old.total + 1 };
        }
      );
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
    [conversationId, queryClient]
  );

  // ── WebSocket connection factory ───────────────────────────────────────────
  const connectRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!conversationId || !authToken) return;

    isDestroyedRef.current = false;
    retryCountRef.current = 0;
    setRetryCount(0);

    function connect() {
      if (isDestroyedRef.current) return;

      const url = buildWsUrl(conversationId!, authToken!);
      const ws = new WebSocket(url);
      wsRef.current = ws;
      setReadyState("connecting");

      ws.onopen = () => {
        retryCountRef.current = 0;
        setRetryCount(0);
        setReadyState("open");
      };

      ws.onerror = () => {
        setReadyState("error");
      };

      ws.onclose = (event: CloseEvent) => {
        wsRef.current = null;
        setReadyState("closed");

        if (isDestroyedRef.current) return;

        // ── Permanent failures — do NOT reconnect ──────────────────────────
        if (NON_RECOVERABLE_CODES.has(event.code)) {
          const reason =
            event.code === 4401
              ? "auth"
              : event.code === 4403
              ? "forbidden"
              : "not_found";
          onFatalError?.(reason);
          return;
        }

        // ── Retryable failures — exponential backoff ───────────────────────
        if (retryCountRef.current >= MAX_RETRIES) {
          onFatalError?.("max_retries");
          return;
        }

        const delay = getBackoffMs(retryCountRef.current);
        retryCountRef.current += 1;
        setRetryCount(retryCountRef.current);

        retryTimerRef.current = setTimeout(() => {
          if (!isDestroyedRef.current) connect();
        }, delay);
      };

      ws.onmessage = (event: MessageEvent) => {
        try {
          const wsEvent = JSON.parse(event.data as string) as WsEvent;

          switch (wsEvent.type) {
            // ── Backend heartbeat: server sends ping, client replies pong ──
            case "ping": {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: "pong" }));
              }
              break;
            }

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
            case "conversation.status": {
              if (conversationId) {
                queryClient.invalidateQueries({
                  queryKey: chatKeys.conversation(conversationId),
                });
              }
              break;
            }

            // ── Rate limit error from server ───────────────────────────────
            case "error": {
              const errPayload = wsEvent.payload as { code?: number; detail?: string };
              if (errPayload?.code === 4029) {
                // Rate limited — transient, no need to reconnect
                console.warn("[ChatWS] Rate limit exceeded:", errPayload.detail);
              }
              break;
            }

            default:
              break;
          }
        } catch {
          // Silently ignore malformed WebSocket frames
        }
      };
    }

    connectRef.current = connect;
    connect();

    return () => {
      isDestroyedRef.current = true;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [
    conversationId,
    authToken,
    injectMessageIntoCache,
    onMessage,
    onTyping,
    onPresence,
    onFatalError,
    setReadyState,
    queryClient,
  ]);

  // ── Send Event Helper ──────────────────────────────────────────────────────
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
    retryCount,
  };
}
