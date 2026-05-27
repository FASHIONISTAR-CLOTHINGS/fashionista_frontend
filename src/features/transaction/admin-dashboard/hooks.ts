/**
 * features/transaction/admin-dashboard/hooks.ts
 */

import { useQuery } from "@tanstack/react-query";
import { fetchAdminTransactions, fetchAdminTransactionKPIs } from "./api";

export const adminTransactionKeys = {
  all: ["admin-transactions"] as const,
  kpis: ["admin-transactions", "kpis"] as const,
};

export function useAdminTransactions() {
  return useQuery({
    queryKey: adminTransactionKeys.all,
    queryFn: fetchAdminTransactions,
  });
}

export function useAdminTransactionKPIs() {
  return useQuery({
    queryKey: adminTransactionKeys.kpis,
    queryFn: fetchAdminTransactionKPIs,
  });
}
