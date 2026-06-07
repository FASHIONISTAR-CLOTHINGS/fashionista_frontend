import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientService } from "@/features/client/services/client.service";
import type { ClientProfileUpdatePayload } from "@/features/client/types/client.types";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useIsHydrated } from "@/lib/react/useIsHydrated";

const CLIENT_PROFILE_QUERY_KEY = ["client", "profile"] as const;
const CLIENT_DASHBOARD_QUERY_KEY = ["client", "dashboard"] as const;

export function useClientProfile() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hydrated = useIsHydrated();

  return useQuery({
    queryKey: CLIENT_PROFILE_QUERY_KEY,
    queryFn: clientService.getProfile,
    enabled: hydrated && isAuthenticated,
    staleTime: 30_000,
  });
}

export function useClientDashboard() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hydrated = useIsHydrated();

  return useQuery({
    queryKey: CLIENT_DASHBOARD_QUERY_KEY,
    queryFn: clientService.getDashboard,
    enabled: hydrated && isAuthenticated,
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
