import { useQuery } from "@tanstack/react-query";
import { fetchAdminDashboardKPI, type AdminDashboardKPI } from "../api/dashboard.api";

export function useAdminDashboardKPI() {
  return useQuery<AdminDashboardKPI, Error>({
    queryKey: ["admin", "dashboard", "kpi"],
    queryFn: fetchAdminDashboardKPI,
    staleTime: 60_000, // 1 minute
    refetchInterval: 60_000, // Polling every minute to keep dashboard live
  });
}
