/**
 * @module use-toast
 *
 * Fashionistar centralized toast hook.
 * Wraps Sonner's `toast` function with domain-specific presets and consistent
 * styling across the entire platform.
 *
 * Usage:
 *   const { success, error, info, loading, dismiss } = useToast();
 *   success("Order placed!", { description: "Your order is confirmed." });
 *   error("Payment failed", { description: err.message });
 */
"use client";

import { useCallback } from "react";
import { toast as sonnerToast, type ExternalToast } from "sonner";

export interface ToastOptions extends ExternalToast {
  description?: string;
}

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

  return { success, error, info, warning, loading, promise, dismiss };
}
