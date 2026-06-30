/**
 * features/payment/admin-dashboard/hooks.ts
 */

import { useQuery } from "@tanstack/react-query";
import { fetchAdminPayments, fetchAdminPaymentKPIs } from "./api";

export const adminPaymentKeys = {
  all: ["admin-payments"] as const,
  kpis: ["admin-payments", "kpis"] as const,
};

export function useAdminPayments() {
  return useQuery({
    queryKey: adminPaymentKeys.all,
    queryFn: fetchAdminPayments,
  });
}

export function useAdminPaymentKPIs() {
  return useQuery({
    queryKey: adminPaymentKeys.kpis,
    queryFn: fetchAdminPaymentKPIs,
  });
}
