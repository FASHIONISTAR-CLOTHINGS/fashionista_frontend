/**
 * @module shared barrel
 *
 * Single public API for all Fashionistar shared infrastructure.
 *
 * RULE: Feature code MUST ONLY import from "@/shared".
 * Deep imports (e.g. "@/shared/hooks/use-toast") are FORBIDDEN.
 * This allows internal reorganisation without breaking feature imports.
 */

// ── Components ──────────────────────────────────────────────────────────────
export {
  ErrorBoundary,
  GlobalToastProvider,
  CardSkeleton,
  CardGridSkeleton,
  TableRowSkeleton,
  ListItemSkeleton,
  StatSkeleton,
  ProfileSkeleton,
  FormSkeleton,
} from "./components";

// ── Hooks ───────────────────────────────────────────────────────────────────
export {
  useOptimisticMutation,
  useInfiniteScroll,
  useToast,
} from "./hooks";

export type {
  UseOptimisticMutationOptions,
  UseInfiniteScrollOptions,
  ToastOptions,
} from "./hooks";
