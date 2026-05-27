/**
 * features/providers/admin-dashboard/hooks.ts
 */

import { useQuery } from "@tanstack/react-query";
import { fetchAdminProviders } from "./api";

export const adminProviderKeys = {
  all: ["admin-providers"] as const,
};

export function useAdminProviders() {
  return useQuery({
    queryKey: adminProviderKeys.all,
    queryFn: fetchAdminProviders,
  });
}
