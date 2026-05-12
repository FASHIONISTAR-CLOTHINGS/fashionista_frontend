/**
 * @file index.ts
 * @description Public barrel exports for the `features/account` FSD slice.
 *
 * Account domain aggregates 4 Ninja async reads into a unified user account surface:
 *  1. ClientProfile  → /api/v1/ninja/client/profile/
 *  2. WalletBalance  → /api/v1/ninja/wallet/dashboard/
 *  3. OrderCounts    → /api/v1/ninja/orders/counts/
 *  4. Transactions   → /api/v1/ninja/transactions/recent/
 *
 * Mutations use DRF sync: profile update, address CRUD.
 */

// ── Types ──────────────────────────────────────────────────────────────────────
export type {
  AccountAddress,
  AccountProfile,
  AccountWalletBalance,
  AccountOrderCounts,
  AccountRecentTransaction,
  AccountDashboard,
  TransactionKind,
  TransactionStatus,
  UpdateProfileInput,
  AddAddressInput,
} from "./types/account.types";

// ── Schemas ────────────────────────────────────────────────────────────────────
export {
  AccountAddressSchema,
  AccountProfileSchema,
  AccountWalletBalanceSchema,
  AccountOrderCountsSchema,
  AccountRecentTransactionSchema,
  AccountRecentTransactionsListSchema,
  parseAccountResponse,
} from "./schemas/account.schemas";

// ── API ────────────────────────────────────────────────────────────────────────
export {
  fetchAccountProfile,
  fetchAccountWalletBalance,
  fetchAccountOrderCounts,
  fetchAccountRecentTransactions,
  updateAccountProfile,
  addAccountAddress,
  updateAccountAddress,
  deleteAccountAddress,
  setDefaultAddress,
} from "./api/account.api";

// ── TanStack Query Hooks ───────────────────────────────────────────────────────
export {
  accountKeys,
  // Individual reads
  useAccountProfile,
  useAccountWalletBalance,
  useAccountOrderCounts,
  useAccountRecentTransactions,
  // Parallel bundle (4-way useQueries)
  useAccountDashboard,
  // Profile mutations
  useUpdateAccountProfile,
  // Address mutations
  useAddAccountAddress,
  useUpdateAccountAddress,
  useDeleteAccountAddress,
  useSetDefaultAddress,
} from "./hooks/use-account";
