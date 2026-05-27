/**
 * features/admin/settings/hooks/useAdminSettings.ts
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchGlobalSettings, updateGlobalSettings, type GlobalSettings } from "../api";
import { toast } from "sonner";

export function useGlobalSettings() {
  return useQuery({
    queryKey: ["admin", "global-settings"],
    queryFn: fetchGlobalSettings,
    staleTime: 60_000,
  });
}

export function useUpdateGlobalSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GlobalSettings) => updateGlobalSettings(data),
    onSuccess: () => {
      toast.success("Global platform settings updated successfully.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "global-settings"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update global settings.");
    },
  });
}
