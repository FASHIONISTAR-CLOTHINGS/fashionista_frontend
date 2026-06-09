/**
 * @module shared/components barrel
 *
 * Public API for all shared UI components.
 * Feature code MUST import from "@/components" — never from deep paths.
 */
export { ErrorBoundary } from "./error-boundary";
export { GlobalToastProvider } from "./toast-provider";

// ── App-level loading gate ──────────────────────────────────────────────────
export { GlobalSkeletonGate } from "./global-skeleton-gate";
export type { GlobalSkeletonGateProps } from "./global-skeleton-gate";

// Skeleton factory — all skeleton variants
export {
  CardSkeleton,
  CardGridSkeleton,
  TableRowSkeleton,
  ListItemSkeleton,
  StatSkeleton,
  ProfileSkeleton,
  FormSkeleton,
} from "./skeletons";
