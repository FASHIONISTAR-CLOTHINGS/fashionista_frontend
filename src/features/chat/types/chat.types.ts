/**
 * features/chat/types/chat.types.ts
 *
 * Canonical type system for the features/chat FSD slice.
 * Mirrors the Django Chat domain (apps/chat/models/conversation.py).
 *
 * Import ONLY from 'features/chat' public barrel — never from deep paths.
 */

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────────────────

export type ConversationStatus =
  | "active"
  | "archived"
  | "blocked"
  | "escalated";

export type MessageType =
  | "text"
  | "offer"
  | "image"
  | "system"
  | "delivery_confirm";

export type OfferStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "expired"
  | "cancelled";

export type WebSocketReadyState = "connecting" | "open" | "closed" | "error";

// ─────────────────────────────────────────────────────────────────────────────
// PARTICIPANTS
// ─────────────────────────────────────────────────────────────────────────────

export interface Participant {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGES
// ─────────────────────────────────────────────────────────────────────────────

export interface Attachment {
  id: string;
  image_url: string | null;
  media_type: "image" | "video";
  alt_text: string;
}

export interface OfferData {
  id: string;
  quantity: number;
  offered_price: string;
  currency: string;
  product_id: string;
  product_title_snapshot: string;
  status: OfferStatus;
  expires_at: string | null;
  responded_at: string | null;
  notes: string;
  created_at: string;
}

export interface Message {
  id: string;
  body: string;
  message_type: MessageType;
  author_id: string | null;
  author_name: string;
  is_read_by_buyer: boolean;
  is_read_by_vendor: boolean;
  is_deleted: boolean;
  media: Attachment | null;
  offer: OfferData | null;
  created_at: string;
  is_own?: boolean; // Derived client-side from current user ID
}

export interface PendingMessage extends Omit<Message, "id"> {
  id: `pending-${string}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONVERSATIONS
// ─────────────────────────────────────────────────────────────────────────────

export interface Conversation {
  id: string;
  product_id: string | null;
  status: ConversationStatus;
  product_title_snapshot: string;
  other_party_id: string;
  other_party_name: string;
  last_message_at: string | null;
  unread_count: number;
  last_message_preview: string;
}

export interface ConversationDetail {
  messages: Message[];
}

export type ConversationFeed = Conversation[];

// ─────────────────────────────────────────────────────────────────────────────
// API REQUEST / RESPONSE SHAPES
// ─────────────────────────────────────────────────────────────────────────────

export interface SendMessageInput {
  body: string;
  message_type?: MessageType;
}

export interface StartConversationInput {
  vendor_id: string;
  product_id?: string;
  product_title_snapshot?: string;
  initial_message?: string;
}

export interface MessagePage {
  messages: Message[];
  has_more: boolean;
  page: number;
  total: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// WEBSOCKET EVENTS
// ─────────────────────────────────────────────────────────────────────────────

export type WsEventType =
  | "message.new"
  | "message.read"
  | "message.deleted"
  | "user.typing"
  | "user.online"
  | "user.offline"
  | "offer.update"
  | "conversation.status"
  | "error";

export interface WsEvent<T = unknown> {
  type: WsEventType;
  payload: T;
  timestamp: string;
}

export interface WsNewMessagePayload {
  conversation_id: string;
  message: Message;
}

export interface WsTypingPayload {
  conversation_id: string;
  user_id: string;
  user_name: string;
}

export interface WsPresencePayload {
  user_id: string;
  is_online: boolean;
}

export interface WsNotificationPayload {
  unread_count: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// QUERY KEY FACTORY (TanStack Query v5)
// ─────────────────────────────────────────────────────────────────────────────

export const chatKeys = {
  all:                     () => ["chat"] as const,
  conversations:           () => [...chatKeys.all(), "conversations"] as const,
  conversation:            (id: string) => [...chatKeys.conversations(), id] as const,
  messages:                (convId: string) => [...chatKeys.conversation(convId), "messages"] as const,
  messagesPage:            (convId: string, page: number) => [...chatKeys.messages(convId), page] as const,
  unreadCount:             () => [...chatKeys.all(), "unread-count"] as const,
} as const;
