/**
 * features/chat/index.ts
 *
 * Public barrel for the `features/chat` canonical FSD slice.
 *
 * Import ONLY from 'features/chat' — never from deep internal paths.
 * This enforces the FSD boundary rule.
 *
 * Usage:
 *   import { useConversations, useSendMessage, chatKeys } from 'features/chat';
 */

// ── Types ──────────────────────────────────────────────────────────────────
export type {
  Conversation,
  ConversationDetail,
  ConversationFeed,
  Message,
  PendingMessage,
  Participant,
  Attachment,
  OfferData,
  OfferStatus,
  MessagePage,
  SendMessageInput,
  StartConversationInput,
  ConversationStatus,
  MessageType,
  WsEvent,
  WsEventType,
  WsNewMessagePayload,
  WsTypingPayload,
  WsPresencePayload,
  WebSocketReadyState,
} from "./types/chat.types";

export { chatKeys } from "./types/chat.types";

// ── API Functions ──────────────────────────────────────────────────────────
export {
  fetchConversationFeed,
  fetchConversationDetail,
  fetchMessages,
  sendMessage,
  markConversationRead,
  startConversation,
  acceptOffer,
  rejectOffer,
} from "./api/chat.api";

// ── TanStack Query Hooks ───────────────────────────────────────────────────
export {
  useConversations,
  useConversationDetail,
  useMessages,
  useSendMessage,
  useMarkConversationRead,
  useStartConversation,
} from "./hooks/use-chat";

// ── WebSocket Hook ─────────────────────────────────────────────────────────
export {
  useChatWebSocket,
} from "./hooks/use-chat-websocket";

export type {
  UseChatWebSocketOptions,
  UseChatWebSocketReturn,
} from "./hooks/use-chat-websocket";

export {
  ConversationList,
} from "./components/ConversationList";

export {
  MessageThread,
} from "./components/MessageThread";

export {
  MessageInput,
} from "./components/MessageInput";

export {
  OfferCard,
} from "./components/OfferCard";
