/**
 * @module shared/components barrel
 *
 * Public API for all shared UI components.
 * Feature code MUST import from "@/shared" — never from deep paths.
 */
export { ErrorBoundary } from "./error-boundary";
export { GlobalToastProvider } from "./toast-provider";

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
