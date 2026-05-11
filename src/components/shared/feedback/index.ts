/**
 * components/shared/feedback/index.ts
 *
 * Purpose:
 *   Exports all shared feedback UI components for use by feature slices via
 *   '@/components/shared/feedback'.
 *
 * Exported Symbols:
 *   - NewFooter         : Canonical public footer (newsletter + dark body + bottom bar)
 *   - AuthAlert         : Enterprise animated alert (error | success | warning | info)
 *   - FieldError        : Inline form field error message
 *   - RichErrorMessage  : Rich error display with icon + message
 *
 * Usage:
 *   import { NewFooter } from "@/components/shared/feedback";
 *   import { AuthAlert, FieldError } from "@/components/shared/feedback";
 */

export { default as NewFooter } from "./NewFooter";
export { AuthAlert, FieldError } from "./AuthAlert";
export { RichErrorMessage } from "./RichErrorMessage";

