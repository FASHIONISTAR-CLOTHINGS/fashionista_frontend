import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientService } from "@/features/client/services/client.service";
import type { ClientProfileUpdatePayload } from "@/features/client/types/client.types";

const CLIENT_PROFILE_QUERY_KEY = ["client", "profile"] as const;
const CLIENT_DASHBOARD_QUERY_KEY = ["client", "dashboard"] as const;

export function useClientProfile() {
  return useQuery({
    queryKey: CLIENT_PROFILE_QUERY_KEY,
    queryFn: clientService.getProfile,
    staleTime: 30_000,
  });
}

export function useClientDashboard() {
  return useQuery({
    queryKey: CLIENT_DASHBOARD_QUERY_KEY,
    queryFn: clientService.getDashboard,
    staleTime: 30_000,
  });
}

export function useUpdateClientProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ClientProfileUpdatePayload) =>
      clientService.updateProfile(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: CLIENT_PROFILE_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: CLIENT_DASHBOARD_QUERY_KEY }),
      ]);
    },
  });
}
