/**
 * @file index.ts
 * @description Public API for the `features/client` canonical FSD slice.
 *
 * Dual-Engine Strategy:
 *  - DRF (sync)   → /v1/client/ (profile, orders, wishlist, reviews, wallet transfers)
 *  - Ninja (async) → /ninja/client/ (dashboard snapshot from ClientProfile.aget_full_dashboard_snapshot)
 */

// ── API ────────────────────────────────────────────────────────────────────
export * from "@/features/client/api/client.api";

// ── Components ─────────────────────────────────────────────────────────────
export * from "@/features/client/components/client-shell";
export * from "@/features/client/components/client-views";

// ── TanStack Query Hooks ───────────────────────────────────────────────────
export * from "@/features/client/hooks/use-client-profile";
export * from "@/features/client/hooks/use-client-orders";
export * from "@/features/client/hooks/use-client-wishlist";
export * from "@/features/client/hooks/use-client-wallet";
export * from "@/features/client/hooks/use-client-reviews";

// ── Schemas ────────────────────────────────────────────────────────────────
export * from "@/features/client/schemas/client.schemas";

// ── Zustand Stores ─────────────────────────────────────────────────────────
export * from "@/features/client/store/client.store";

// ── Types ──────────────────────────────────────────────────────────────────
export * from "@/features/client/types/client.types";
