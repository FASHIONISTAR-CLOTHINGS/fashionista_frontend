/**
 * RichErrorMessage — Premium Enterprise-Grade Error Display Component
 * RichErrorMessage — Backward-Compatible Wrapper for AuthAlert

 *
 * All existing usages of <RichErrorMessage parsed={...} /> continue to work.
 * Now powered by the new AuthAlert system with animations + auto-dismiss.
 *
 * Used in: OTPVerifyForm, LoginForm, RegisterForm, PasswordResetForm
 */
"use client";

export { FieldError } from "@/components/shared/feedback/AuthAlert";
export type { AlertVariant } from "@/components/shared/feedback/AuthAlert";

import { AuthAlert } from "@/components/shared/feedback/AuthAlert";
import type { ParsedApiError } from "@/lib/api/parseApiError";

interface RichErrorMessageProps {
  parsed: ParsedApiError;
  className?: string;
  /** Auto-dismiss ms (default: 0 = never) */
  autoDismissMs?: number;
}

export function RichErrorMessage({
  parsed,
  className,
  autoDismissMs = 0,
}: RichErrorMessageProps) {
  return (
    <AuthAlert
      variant="error"
      parsed={parsed}
      autoDismissMs={autoDismissMs}
      dismissible
      className={className}
    />
  );
}
