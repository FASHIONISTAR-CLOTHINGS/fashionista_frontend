/**
 * features/support/hooks/use-support.ts
 *
 * TanStack Query v5 hooks for the support domain.
 *
 * Hooks:
 *   - useMyTickets: User's ticket feed with optional status/category filters.
 *   - useTicketDetail: Single ticket detail + message thread.
 *   - useCreateTicket: Create ticket mutation with cache invalidation.
 *   - useAddMessage: Add message mutation with optimistic update.
 *   - useUpdateTicketStatus: Staff status transition mutation.
 *   - useEscalateTicket: Staff escalation mutation.
 *   - useAdminQueue: Staff admin queue query.
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchMyTickets,
  fetchTicketDetail,
  createTicket,
  addTicketMessage,
  updateTicketStatus,
  escalateTicket,
  fetchAdminQueue,
} from "../api/support.api";
import { supportKeys } from "../types/support.types";
import type {
  SupportTicket,
  SupportTicketListItem,
  TicketMessage,
  CreateTicketInput,
  AddMessageInput,
  UpdateStatusInput,
  EscalateInput,
  TicketStatus,
  TicketCategory,
  TicketEscalation,
} from "../types/support.types";

// ─────────────────────────────────────────────────────────────────────────────
// READ QUERIES
// ─────────────────────────────────────────────────────────────────────────────

export function useMyTickets(filters?: {
  status?: TicketStatus;
  category?: TicketCategory;
}) {
  return useQuery<SupportTicketListItem[], Error>({
    queryKey: [...supportKeys.tickets(), filters ?? {}],
    queryFn:  () => fetchMyTickets(filters),
    staleTime: 60_000,
  });
}

export function useTicketDetail(ticketId: string | null) {
  return useQuery<SupportTicket, Error>({
    queryKey: supportKeys.ticket(ticketId ?? ""),
    queryFn:  () => fetchTicketDetail(ticketId!),
    enabled:  !!ticketId,
    staleTime: 30_000,
  });
}

export function useAdminQueue(filters?: {
  status?: TicketStatus;
  category?: TicketCategory;
}) {
  return useQuery<SupportTicketListItem[], Error>({
    queryKey: [...supportKeys.adminQueue(), filters ?? {}],
    queryFn:  () => fetchAdminQueue(filters),
    staleTime: 30_000,
    refetchInterval: 60_000, // Auto-refresh admin queue every 60s
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE TICKET
// ─────────────────────────────────────────────────────────────────────────────

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation<SupportTicket, Error, CreateTicketInput>({
    mutationFn: createTicket,
    onSuccess: (newTicket) => {
      // Invalidate ticket list so the new ticket appears
      queryClient.invalidateQueries({ queryKey: supportKeys.tickets() });
      // Pre-populate the detail cache with the response
      queryClient.setQueryData(
        supportKeys.ticket(newTicket.id),
        newTicket
      );
      toast.success("Support ticket opened. Our team will respond within 24 hours.");
    },
    onError: () => {
      toast.error("Failed to open ticket. Please try again.");
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ADD MESSAGE (Optimistic)
// ─────────────────────────────────────────────────────────────────────────────

export function useAddMessage(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    TicketMessage,
    Error,
    AddMessageInput,
    { snapshot?: SupportTicket }
  >({
    mutationFn: (input) => addTicketMessage(ticketId, input),

    // Optimistically add a pending message to the thread
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: supportKeys.ticket(ticketId) });

      const snapshot = queryClient.getQueryData<SupportTicket>(
        supportKeys.ticket(ticketId)
      );

      const pendingMessage: TicketMessage = {
        id:            `pending-${Date.now()}`,
        author_name:   "You",
        body:          variables.body,
        is_staff_reply: false,
        attachments:   variables.attachments ?? [],
        created_at:    new Date().toISOString(),
      };

      queryClient.setQueryData<SupportTicket>(
        supportKeys.ticket(ticketId),
        (old) => {
          if (!old) return old;
          return { ...old, messages: [...old.messages, pendingMessage] };
        }
      );

      return { snapshot };
    },

    // Replace pending with real message
    onSuccess: (serverMessage) => {
      queryClient.setQueryData<SupportTicket>(
        supportKeys.ticket(ticketId),
        (old) => {
          if (!old) return old;
          const messages = old.messages.map((m) =>
            m.id.startsWith("pending-") ? serverMessage : m
          );
          return { ...old, messages };
        }
      );
    },

    // Rollback on failure
    onError: (_err, _vars, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(supportKeys.ticket(ticketId), context.snapshot);
      }
      toast.error("Failed to send message. Please try again.");
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// STAFF MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

export function useUpdateTicketStatus(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation<SupportTicket, Error, UpdateStatusInput>({
    mutationFn: (input) => updateTicketStatus(ticketId, input),
    onSuccess: (updated) => {
      queryClient.setQueryData(supportKeys.ticket(ticketId), updated);
      queryClient.invalidateQueries({ queryKey: supportKeys.tickets() });
      queryClient.invalidateQueries({ queryKey: supportKeys.adminQueue() });
      toast.success(`Ticket status updated to '${updated.status}'.`);
    },
    onError: () => {
      toast.error("Status update failed.");
    },
  });
}

export function useEscalateTicket(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation<TicketEscalation, Error, EscalateInput>({
    mutationFn: (input) => escalateTicket(ticketId, input),
    onSuccess: () => {
      // Refetch ticket detail to show escalation record
      queryClient.invalidateQueries({ queryKey: supportKeys.ticket(ticketId) });
      queryClient.invalidateQueries({ queryKey: supportKeys.adminQueue() });
      toast.success("Ticket escalated for admin review.");
    },
    onError: () => {
      toast.error("Escalation failed. Please try again.");
    },
  });
}
