/**
 * @module shared barrel
 *
 * Single public API for all Fashionistar shared infrastructure.
 *
 * RULE: Feature code MUST ONLY import from "@/components".
 * Deep imports (e.g. "@/components/hooks/use-toast") are FORBIDDEN.
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
  PageSkeleton,
  ProductDetailSkeleton,
} from "./components";

// ── Hooks ───────────────────────────────────────────────────────────────────
export {
  useOptimisticMutation,
  useInfiniteScroll,
  useToast,
  toast,
  useNetworkStatus,
  useAuditableAction,
} from "./hooks";

export type {
  UseOptimisticMutationOptions,
  UseInfiniteScrollOptions,
  ToastOptions,
  UseNetworkStatusOptions,
  UseNetworkStatusReturn,
} from "./hooks";
  
// UI MAIN INDEX CORE COMPONENTS EXPORT
export * from "./ui";
// UI Primitives
export * from "./ui/primitives";
// UI Composites
export * from "./ui/composites";



// Shared Feedback Components
export * from "./shared/feedback";
// Shared Forms Components
export * from "./shared/forms";
// Shared Icons Components
export * from "./shared/icons";
// Shared Navigation Components
export * from "./shared/navigation";
// Shared Overlays
export * from "./shared/overlays";
// Shared Preloader Components
export * from "./shared/preloader/index";
// Shared Utilities Components



// Animations
export * from "./animations";
// Reference Data
export * from "./reference-data";



//  Components
export * from "./components";

//  Media Components
export * from "./media";

// Theme Provider
export * from "./providers";
export * from "./media";

// Theme Settings
export * from "./settings";


export {UserAvatar,UserRoleBadge} from "./UserAvatar";
