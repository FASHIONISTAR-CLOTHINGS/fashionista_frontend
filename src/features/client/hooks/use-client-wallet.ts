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
import { getNinjaTransactionDashboard } from "@/features/transaction/api/transaction.api";
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
 * balance endpoint and the Ninja transaction dashboard.
 */
export function useClientWalletBalance() {
  return useQuery<WalletDashboardData>({
    queryKey:  clientWalletKeys.dashboard,
    queryFn:   async (): Promise<WalletDashboardData> => {
      const [raw, txDashboard] = await Promise.all([
        clientApi.getWalletBalance(),
        getNinjaTransactionDashboard().catch((err) => {
          console.error("Failed to load Ninja transaction dashboard:", err);
          return {
            inflow: "0",
            outflow: "0",
            net: "0",
            count: 0,
            status_breakdown: {},
            recent_transactions: [],
          };
        }),
      ]);

      const balanceNgn = parseFloat(raw.balance || "0");
      const inflowNgn = parseFloat(txDashboard.inflow || "0");

      const mappedTransactions = (txDashboard.recent_transactions || []).map((record) => {
        let status: "pending" | "paid" | "completed" | "failed" | "refunded" = "pending";
        if (record.status === "completed") {
          status = "completed";
        } else if (record.status === "failed") {
          status = "failed";
        } else if (record.status === "reversed") {
          status = "refunded";
        }

        return {
          id: record.id,
          order: record.order_id || record.reference,
          amount: record.amount,
          currency: "NGN",
          description: record.description,
          payment_system: "Wallet",
          transaction_type: record.direction === "inbound" ? ("deposit" as const) : ("withdrawal" as const),
          status,
          created_at: record.created_at,
          date_and_time: record.created_at,
        };
      });

      return {
        balance_ngn:       balanceNgn,
        total_amount_ngn:  inflowNgn || balanceNgn,
        transaction_count: txDashboard.count || mappedTransactions.length,
        transactions:      mappedTransactions,
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
