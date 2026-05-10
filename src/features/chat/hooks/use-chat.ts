/**
 * features/chat/hooks/use-chat.ts
 *
 * Master TanStack Query v5 hooks for the chat domain.
 *
 * Architecture:
 *   - useConversations: Feed of user conversations.
 *   - useConversationDetail: Single conversation + initial message page.
 *   - useMessages: Infinite paginated messages with prepend-on-WS-event.
 *   - useSendMessage: Optimistic send mutation with rollback on failure.
 *   - useMarkConversationRead: Fire-and-forget read receipt.
 *   - useStartConversation: Create new conversation or return existing.
 *
 * REST polling fallback:
 *   When wsConnected=false, refetchInterval=10_000 activates automatically.
 *   When wsConnected=true, refetchInterval=false (WebSocket handles updates).
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchConversationFeed,
  fetchConversationDetail,
  fetchMessages,
  sendMessage,
  markConversationRead,
  startConversation,
} from "../api/chat.api";
import { chatKeys } from "../types/chat.types";
import type {
  Conversation,
  Message,
  SendMessageInput,
  StartConversationInput,
  ConversationFeed,
  MessagePage,
} from "../types/chat.types";

// ─────────────────────────────────────────────────────────────────────────────
// CONVERSATIONS
// ─────────────────────────────────────────────────────────────────────────────

export function useConversations(wsConnected = true) {
  return useQuery({
    queryKey: chatKeys.conversations(),
    queryFn:  fetchConversationFeed,
    staleTime: 30_000,
    // REST polling fallback when WebSocket is not connected
    refetchInterval: wsConnected ? false : 10_000,
  });
}

export function useConversationDetail(
  conversationId: string | null,
  wsConnected = true
) {
  return useQuery({
    queryKey: chatKeys.conversation(conversationId ?? ""),
    queryFn:  () => fetchConversationDetail(conversationId!),
    enabled:  !!conversationId,
    staleTime: 30_000,
    refetchInterval: wsConnected ? false : 10_000,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGES (Infinite scroll)
// ─────────────────────────────────────────────────────────────────────────────

export function useMessages(
  conversationId: string | null,
  wsConnected = true
) {
  return useQuery<MessagePage, Error>({
    queryKey:  chatKeys.messagesPage(conversationId ?? "", 1),
    queryFn:   () => fetchMessages(conversationId!, 1),
    enabled:   !!conversationId,
    staleTime: 20_000,
    refetchInterval: wsConnected ? false : 10_000,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SEND MESSAGE (Optimistic update)
// ─────────────────────────────────────────────────────────────────────────────

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    Message,
    Error,
    SendMessageInput,
    { previousData?: MessagePage }
  >({
    mutationFn: (input) => sendMessage(conversationId, input),

    // 1. Optimistically add pending message to cache
    onMutate: async (variables) => {
      // Cancel in-flight queries for this conversation
      await queryClient.cancelQueries({ queryKey: chatKeys.messages(conversationId) });

      const pendingMessage: Message = {
        id:              `pending-${Date.now()}`,
        body:            variables.body,
        message_type:    variables.message_type ?? "text",
        author_id:       "current-user",
        author_name:     "You",
        is_read_by_buyer: true,
        is_read_by_vendor: false,
        is_deleted:      false,
        media:           null,
        offer:           null,
        created_at:      new Date().toISOString(),
        is_own:          true,
      };

      // Snapshot previous state for rollback
      const previousData = queryClient.getQueryData<MessagePage>(
        chatKeys.messagesPage(conversationId, 1)
      );

      // Optimistically inject pending message
      queryClient.setQueryData<MessagePage>(
        chatKeys.messagesPage(conversationId, 1),
        (old) => {
          if (!old) {
            return {
              messages: [pendingMessage],
              has_more: false,
              page: 1,
              total: 1,
            };
          }
          return { ...old, messages: [pendingMessage, ...old.messages] };
        }
      );

      return { previousData };
    },

    // 2. Replace pending message with real message from server
    onSuccess: (serverMessage) => {
      queryClient.setQueryData<MessagePage>(
        chatKeys.messagesPage(conversationId, 1),
        (old) => {
          if (!old) return old;
          // Replace the pending- entry with the real server message
          const messages = old.messages.map((m) =>
            m.id.startsWith("pending-") ? serverMessage : m
          );
          return { ...old, messages, total: messages.length };
        }
      );
    },

    // 3. Rollback on failure
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          chatKeys.messagesPage(conversationId, 1),
          context.previousData
        );
      }
      toast.error("Failed to send message. Please try again.");
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// MARK CONVERSATION READ
// ─────────────────────────────────────────────────────────────────────────────

export function useMarkConversationRead() {
  const queryClient = useQueryClient();

  return useMutation<{ status: string; marked_read: number }, Error, string>({
    mutationFn: markConversationRead,
    onSuccess: (_, conversationId) => {
      // Update unread count in conversation feed
      queryClient.setQueryData<ConversationFeed>(
        chatKeys.conversations(),
        (old) => {
          if (!old) return old;
          return old.map((conv: Conversation) =>
            conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
          );
        }
      );
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// START CONVERSATION
// ─────────────────────────────────────────────────────────────────────────────

export function useStartConversation() {
  const queryClient = useQueryClient();

  return useMutation<Conversation, Error, StartConversationInput>({
    mutationFn: startConversation,
    onSuccess: () => {
      // Invalidate feed so the new conversation appears
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
    onError: () => {
      toast.error("Could not start conversation. Please try again.");
    },
  });
}
