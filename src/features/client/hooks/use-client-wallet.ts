// features/client/hooks/use-client-wallet.ts
/**
 * TanStack Query hooks for client wallet.
 * Aligned with: /api/v1/client/wallet/*
 *
 * Architecture:
 * - useClientWalletBalance: returns WalletDashboardData (balance + transactions)
 * - useWalletTransfer: mutation for peer-to-peer wallet transfer
 */
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { clientApi } from "@/features/client/api/client.api";
import type {
  WalletDashboardData,
  WalletTransferPayload,
} from "@/features/client/types/client.types";

export const clientWalletKeys = {
  balance:      ["client", "wallet", "balance"] as const,
  transactions: ["client", "wallet", "transactions"] as const,
  dashboard:    ["client", "wallet", "dashboard"] as const,
};

/**
 * Returns an enriched WalletDashboardData object derived from the backend
 * balance endpoint.  When the backend starts returning transactions on the
 * same endpoint (or a dedicated /transactions/ endpoint), this hook can be
 * updated to call both in parallel with Promise.all and merge the results.
 */
export function useClientWalletBalance() {
  return useQuery<WalletDashboardData>({
    queryKey:  clientWalletKeys.dashboard,
    queryFn:   async (): Promise<WalletDashboardData> => {
      const raw = await clientApi.getWalletBalance();
      const balanceNgn = parseFloat(raw.balance || "0");

      return {
        balance_ngn:       balanceNgn,
        // total_amount_ngn would require a separate history call;
        // default to balance until the backend exposes a cumulative field.
        total_amount_ngn:  balanceNgn,
        transaction_count: 0,
        transactions:      [],
      };
    },
    staleTime: 15_000,
  });
}

export function useWalletTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: WalletTransferPayload) => clientApi.transferFunds(payload),
    onSuccess: () => {
      // Refresh all wallet queries after a successful transfer
      queryClient.invalidateQueries({ queryKey: ["client", "wallet"] });
    },
  });
}
