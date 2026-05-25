// features/vendor/hooks/use-bank-accounts.ts
/**
 * React Query hooks for the Vendor Bank Account Payout Gate.
 *
 * Hooks:
 *   useBankAccounts()       — GET: list all saved bank accounts
 *   useResolveAccount()     — mutation: resolve account holder name via Paystack
 *   useCreateBankAccount()  — mutation: save new bank account (max 5)
 *   useDeleteBankAccount()  — mutation: soft-delete + Paystack cleanup
 *   useSetDefaultAccount()  — mutation: set default payout account
 *   useRequestPayout()      — mutation: submit payout request
 *
 * Query key factory:
 *   bankAccountKeys.all     — invalidation target for list
 *   bankAccountKeys.lists() — exact list key
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { vendorApi } from "@/features/vendor/api/vendor.api";
import type {
  CreateBankAccountPayload,
  PayoutRequestPayload,
  PayoutRequestResult,
  ResolveAccountPayload,
  VendorBankAccount,
} from "@/features/vendor/types/vendor.types";

// ── Query Key Factory ─────────────────────────────────────────────────────────
export const bankAccountKeys = {
  all:    ["vendor", "bank-accounts"] as const,
  lists:  () => [...bankAccountKeys.all, "list"] as const,
  detail: (id: string) => [...bankAccountKeys.all, "detail", id] as const,
};

// ── 1. List Bank Accounts ─────────────────────────────────────────────────────
export function useBankAccounts() {
  return useQuery<VendorBankAccount[], Error>({
    queryKey: bankAccountKeys.lists(),
    queryFn:  () => vendorApi.listBankAccounts(),
    staleTime: 1000 * 60 * 2,  // 2 min — bank accounts don't change often
    retry: 2,
  });
}

// ── 2. Resolve Account Name ───────────────────────────────────────────────────
export function useResolveAccount() {
  return useMutation<
    { account_name: string; account_number: string },
    Error,
    ResolveAccountPayload
  >({
    mutationFn: (payload) => vendorApi.resolveAccountName(payload),
    onError: (err) => {
      const message =
        (err as unknown as { response?: { data?: { error?: string } } })
          ?.response?.data?.error ??
        "Could not verify account. Please check the account number and bank, then try again.";
      toast.error(message);
    },
  });
}

// ── 3. Create Bank Account ────────────────────────────────────────────────────
export function useCreateBankAccount() {
  const queryClient = useQueryClient();

  return useMutation<VendorBankAccount, Error, CreateBankAccountPayload>({
    mutationFn: (payload) => vendorApi.createBankAccount(payload),
    onSuccess: (account) => {
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.all });
      toast.success(
        `Bank account ****${account.account_last4} saved successfully.`
      );
    },
    onError: (err) => {
      const message =
        (err as unknown as { response?: { data?: { error?: string } } })
          ?.response?.data?.error ??
        "Failed to save bank account. Please try again.";
      toast.error(message);
    },
  });
}

// ── 4. Delete Bank Account ────────────────────────────────────────────────────
export function useDeleteBankAccount() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => vendorApi.deleteBankAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.all });
      toast.success("Bank account removed.");
    },
    onError: (err) => {
      const message =
        (err as unknown as { response?: { data?: { error?: string } } })
          ?.response?.data?.error ??
        "Failed to delete bank account. Please try again.";
      toast.error(message);
    },
  });
}

// ── 5. Set Default Account ────────────────────────────────────────────────────
export function useSetDefaultAccount() {
  const queryClient = useQueryClient();

  return useMutation<VendorBankAccount, Error, string>({
    mutationFn: (id) => vendorApi.setDefaultBankAccount(id),
    onSuccess: (account) => {
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.all });
      toast.success(
        `${account.bank_name} ****${account.account_last4} set as default.`
      );
    },
    onError: (err) => {
      const message =
        (err as unknown as { response?: { data?: { error?: string } } })
          ?.response?.data?.error ??
        "Failed to update default account. Please try again.";
      toast.error(message);
    },
  });
}

// ── 6. Request Payout ─────────────────────────────────────────────────────────
export function useRequestPayout() {
  const queryClient = useQueryClient();

  return useMutation<PayoutRequestResult, Error, PayoutRequestPayload>({
    mutationFn: (payload) => vendorApi.requestPayout(payload),
    onSuccess: (result) => {
      // Invalidate wallet balance and transaction history
      queryClient.invalidateQueries({ queryKey: ["vendor", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success(result.message ?? "Payout initiated successfully! 🎉");
    },
    onError: (err) => {
      const message =
        (err as unknown as { response?: { data?: { error?: string } } })
          ?.response?.data?.error ??
        "Payout failed. Please try again or contact support.";
      toast.error(message);
    },
  });
}
