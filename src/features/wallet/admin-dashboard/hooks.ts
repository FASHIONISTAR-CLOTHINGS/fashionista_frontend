/**
 * features/wallet/admin-dashboard/hooks.ts
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAdminWallets, fetchAdminWalletKPIs, toggleWalletFreeze } from "./api";
import { useToast } from "@/shared/hooks/use-toast";

export const adminWalletKeys = {
  all: ["admin-wallets"] as const,
  kpis: ["admin-wallets", "kpis"] as const,
};

export function useAdminWallets() {
  return useQuery({
    queryKey: adminWalletKeys.all,
    queryFn: fetchAdminWallets,
  });
}

export function useAdminWalletKPIs() {
  return useQuery({
    queryKey: adminWalletKeys.kpis,
    queryFn: fetchAdminWalletKPIs,
  });
}

export function useToggleWalletFreeze() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ walletId, action }: { walletId: string; action: "freeze" | "unfreeze" }) =>
      toggleWalletFreeze(walletId, action),
    onSuccess: (_, variables) => {
      toast.success(`Wallet ${variables.walletId} successfully ${variables.action}d`);
      queryClient.invalidateQueries({ queryKey: adminWalletKeys.all });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update wallet status");
    },
  });
}
