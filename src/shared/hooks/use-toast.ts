/**
 * @module use-toast
 *
 * Fashionistar centralized toast hook.
 * Wraps Sonner's `toast` function with domain-specific presets, dedup IDs,
 * and consistent styling across the entire platform.
 *
 * Key behaviours:
 *  - `networkError()` always uses the same ID — rapid retries show ONE toast.
 *  - `apiError(status, message)` deduplicates by HTTP status code.
 *  - All durations are platform-standard (success 4s, error 6s, warning 5s).
 *
 * Usage:
 *   const { success, error, apiError, networkError, info, loading, dismiss } = useToast();
 *   success("Order placed!", { description: "Your order is confirmed." });
 *   error("Payment failed", { description: err.message });
 *   networkError(); // always deduped to one toast
 */
"use client";

import { useCallback } from "react";
import { toast as sonnerToast, type ExternalToast } from "sonner";

export interface ToastOptions extends ExternalToast {
  description?: string;
}

// ── Dedup constants ───────────────────────────────────────────────────────────
const NETWORK_TOAST_ID = "fashionistar-network-error" as const;

export function useToast() {
  const success = useCallback((message: string, options?: ToastOptions) => {
    sonnerToast.success(message, {
      duration: 4000,
      ...options,
    });
  }, []);

  const error = useCallback((message: string, options?: ToastOptions) => {
    sonnerToast.error(message, {
      duration: 6000,
      ...options,
    });
  }, []);

  const info = useCallback((message: string, options?: ToastOptions) => {
    sonnerToast.info(message, {
      duration: 4000,
      ...options,
    });
  }, []);

  const warning = useCallback((message: string, options?: ToastOptions) => {
    sonnerToast.warning(message, {
      duration: 5000,
      ...options,
    });
  }, []);

  const loading = useCallback(
    (message: string, options?: ToastOptions): string | number => {
      return sonnerToast.loading(message, options);
    },
    []
  );

  const promise = useCallback(
    <T>(
      fn: Promise<T>,
      messages: { loading: string; success: string; error: string }
    ) => {
      return sonnerToast.promise(fn, messages);
    },
    []
  );

  const dismiss = useCallback((toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  }, []);

  /**
   * Shows a deduped "Backend Unreachable" toast.
   * Subsequent calls while the toast is visible update it in-place
   * rather than stacking a new one.
   */
  const networkError = useCallback(() => {
    sonnerToast.error("Backend Unreachable 🔌", {
      id: NETWORK_TOAST_ID,
      description:
        "Cannot connect to the Fashionistar server. Please check your internet connection and try again.",
      duration: 8000,
    });
  }, []);

  /**
   * Shows a deduped API error toast.
   * Deduped by HTTP status code so rapid same-error retries show ONE toast.
   * @param status HTTP status code (400, 403, 500, etc.)
   * @param message Human-readable error from the backend or a fallback
   */
  const apiError = useCallback(
    (status: number, message: string, traceId?: string) => {
      const statusLabel =
        status === 400 ? "Validation Error" :
        status === 403 ? "Access Denied" :
        status === 404 ? "Not Found" :
        status === 429 ? "Too Many Requests — Please Slow Down" :
        status === 500 ? "Server Error" :
        `Request Failed (${status})`;

      sonnerToast.error(statusLabel, {
        id: `fashionistar-api-error-${status}`,
        description: traceId ? `${message} (Trace: ${traceId})` : message,
        duration: 6000,
      });
    },
    []
  );

  return {
    success,
    error,
    info,
    warning,
    loading,
    promise,
    dismiss,
    networkError,
    apiError,
  };
}
