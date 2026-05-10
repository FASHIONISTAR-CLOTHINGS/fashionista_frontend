/**
 * @module shared/hooks barrel
 *
 * Public API for all reusable hooks.
 * Feature code MUST import from "@/shared" — never from deep paths.
 */
export { useOptimisticMutation } from "./use-optimistic-mutation";
export type { UseOptimisticMutationOptions } from "./use-optimistic-mutation";

export { useInfiniteScroll } from "./use-infinite-scroll";
export type { UseInfiniteScrollOptions } from "./use-infinite-scroll";

export { useToast } from "./use-toast";
export type { ToastOptions } from "./use-toast";
