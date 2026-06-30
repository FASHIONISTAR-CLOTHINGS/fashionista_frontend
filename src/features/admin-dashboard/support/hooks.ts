/**
 * features/support/admin-dashboard/hooks.ts
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAdminTickets, assignTicket, fetchAdminSlaMetrics } from "./api";
import { useToast } from "@/components";

export const adminSupportKeys = {
  all: ["admin-tickets"] as const,
  filtered: (params: any) => ["admin-tickets", params] as const,
  sla: ["admin-sla-metrics"] as const,
};

export function useAdminTickets(filters?: {
  status?: string;
  priority?: string;
  category?: string;
}) {
  return useQuery({
    queryKey: adminSupportKeys.filtered(filters || {}),
    queryFn: () => fetchAdminTickets(filters),
  });
}

export function useAdminSlaMetrics() {
  return useQuery({
    queryKey: adminSupportKeys.sla,
    queryFn: fetchAdminSlaMetrics,
  });
}

export function useAssignTicket() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (variables: { ticketId: string; assignedTo: string }) =>
      assignTicket(variables.ticketId, variables.assignedTo),
    onSuccess: () => {
      success("Ticket assigned successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
    },
    onError: (err: any) => {
      error(err?.message || "Failed to assign ticket.");
    },
  });
}
