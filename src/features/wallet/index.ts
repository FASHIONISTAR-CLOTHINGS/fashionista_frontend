/**
 * @file index.ts
 * @description Public API for the `features/wallet` canonical FSD slice.
 *
 * Dual-Engine Strategy:
 *  - DRF (sync)    → /v1/wallet/ (wallet read, PIN mutations, withdrawal)
 *  - Ninja (async) → /ninja/wallet/ (balance + hold stats dashboard snapshot)
 *
 * KYC Gate:
 *  - WithdrawalPanel enforces KYC approval client-side before showing form
 *  - POST /v1/wallet/withdraw/ enforces KYC approval server-side
 */

// ── Types ───────────────────────────────────────────────────────────────────────
export type {
  WalletAccount,
  WalletDashboardData,
  WalletHoldStats,
  WalletBalanceSnapshot,
  WalletStatus,
  WalletOwnerType,
  PinPayload,
  ChangePinPayload,
  WithdrawalInput,
  WithdrawalResult,
} from "./types/wallet.types";

// ── Schemas ─────────────────────────────────────────────────────────────────────
export {
  WalletSchema,
  WalletDashboardSchema,
  parseWalletResponse,
} from "./schemas/wallet.schemas";

// ── API Client ──────────────────────────────────────────────────────────────────
export {
  fetchWallet,
  setWalletPin,
  verifyWalletPin,
  changeWalletPin,
  getNinjaWalletDashboard,
  initiateWithdrawal,
} from "./api/wallet.api";

// ── TanStack Query Hooks ────────────────────────────────────────────────────────
export {
  walletKeys,
  // DRF sync reads + mutations
  useWallet,
  useSetWalletPin,
  useVerifyWalletPin,
  useChangeWalletPin,
  // Ninja async read
  useWalletDashboard,
  // Withdrawal (DRF sync + KYC gate)
  useInitiateWithdrawal,
} from "./hooks/use-wallet";

// ── Components ──────────────────────────────────────────────────────────────────
export * from "./components/WalletOverviewView";
export * from "./components/WalletDashboardView";
export { WithdrawalPanel } from "./components/WithdrawalPanel";
