/**
 * @module shared/hooks barrel
 *
 * Public API for all reusable hooks.
 * Feature code MUST import from "@/components" — never from deep paths.
 */
export { useOptimisticMutation } from "./use-optimistic-mutation";
export type { UseOptimisticMutationOptions } from "./use-optimistic-mutation";

export { useInfiniteScroll } from "./use-infinite-scroll";
export type { UseInfiniteScrollOptions } from "./use-infinite-scroll";

export { useToast, toast } from "./use-toast";
export type { ToastOptions } from "./use-toast";

// ── New hooks (Wave G frontend finalization) ────────────────────────────────
export { useNetworkStatus } from "./use-network-status";
export type { UseNetworkStatusOptions, UseNetworkStatusReturn } from "./use-network-status";

export { useAuditableAction } from "./use-auditable-action";
export type { UseAuditableActionOptions } from "./use-auditable-action";
