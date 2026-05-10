/**
 * components/shared/feedback/index.ts
 *
 * Purpose:
 *   Exports shared feedback components for use by feature slices via
 *   '@/components/shared/feedback'.
 *
 * Exported Symbols:
 *   - Footer: legacy public footer
 *   - NewFooter: newer public footer
 *
 * Dependencies:
 *   - All components rely on React 19's "react" import for useActionState
 *   - Some components use cn() utility; ensure @/lib/utils is properly aliased
 *
 * Usage Example:
 *   import { Footer, NewFooter } from "@/components/shared/feedback";
 */

export { default as NewFooter } from "./NewFooter";
