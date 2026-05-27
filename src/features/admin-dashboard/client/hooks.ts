/**
 * features/client/admin-dashboard/hooks.ts
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAdminClients, updateAdminClient } from "./api";
import { toast } from "sonner";
import type { AdminClient } from "./api";

export function useAdminClients() {
  return useQuery({
    queryKey: ["admin", "client", "list"],
    queryFn: fetchAdminClients,
    staleTime: 60_000,
  });
}

export function useUpdateAdminClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdminClient> }) =>
      updateAdminClient(id, data),
    onSuccess: () => {
      toast.success("Client profile updated successfully.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "client", "list"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update client.");
    },
  });
}
