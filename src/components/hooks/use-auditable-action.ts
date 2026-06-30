/**
 * @module use-auditable-action
 *
 * Thin wrapper around a mutation or callback that fires a structured
 * analytics/audit event (via GTM dataLayer) BEFORE the actual action
 * executes, and AFTER it resolves (success or failure).
 *
 * This hook does NOT replace the backend AuditService — it complements it
 * by capturing client-side context (device, session, feature area) that the
 * backend cannot always access.
 *
 * Usage:
 *   const submitOrder = useAuditableAction({
 *     actionName: "checkout_initiated",
 *     category: "payment",
 *     metadata: { product_id: product.id },
 *     fn: () => orderApi.submitOrder(cart),
 *   });
 *
 *   <button onClick={submitOrder}>Checkout</button>
 */
"use client";

import { useCallback } from "react";

export interface UseAuditableActionOptions<T> {
  /**
   * Canonical snake_case action name — mirrors backend EventType values.
   * Examples: "checkout_initiated", "measurement_created", "offer_accepted"
   */
  actionName: string;
  /**
   * Domain category — mirrors backend EventCategory values.
   * Examples: "payment", "cart", "measurement", "chat"
   */
  category: string;
  /** The async function to execute. */
  fn: () => Promise<T> | T;
  /** Additional metadata to attach to the GTM event. */
  metadata?: Record<string, unknown>;
  /** Called when the action succeeds. */
  onSuccess?: (result: T) => void;
  /** Called when the action fails. */
  onError?: (error: unknown) => void;
}

/**
 * Returns a stable callback that fires GTM events around an async action.
 *
 * Args:
 *   options: Configuration including action name, category, fn, and callbacks.
 *
 * Returns:
 *   `() => Promise<T | undefined>` — the auditable action callback.
 */
export function useAuditableAction<T = unknown>({
  actionName,
  category,
  fn,
  metadata,
  onSuccess,
  onError,
}: UseAuditableActionOptions<T>): () => Promise<T | undefined> {
  return useCallback(async () => {
    const timestamp = new Date().toISOString();

    // ── Pre-action GTM event ────────────────────────────────────────────────
    _pushToDataLayer({
      event: "fashionistar_action_start",
      action_name: actionName,
      action_category: category,
      timestamp,
      ...metadata,
    });

    try {
      const result = await fn();

      // ── Post-action success GTM event ───────────────────────────────────
      _pushToDataLayer({
        event: "fashionistar_action_success",
        action_name: actionName,
        action_category: category,
        timestamp: new Date().toISOString(),
        ...metadata,
      });

      onSuccess?.(result);
      return result;
    } catch (err) {
      // ── Post-action failure GTM event ───────────────────────────────────
      _pushToDataLayer({
        event: "fashionistar_action_error",
        action_name: actionName,
        action_category: category,
        timestamp: new Date().toISOString(),
        error: err instanceof Error ? err.message : String(err),
        ...metadata,
      });

      onError?.(err);
      return undefined;
    }
  }, [actionName, category, fn, metadata, onSuccess, onError]); // eslint-disable-line react-hooks/exhaustive-deps
}

// ─── Internal GTM helper ───────────────────────────────────────────────────────

function _pushToDataLayer(event: Record<string, unknown>): void {
  try {
    if (typeof window === "undefined") return;
    // @ts-expect-error — GTM dataLayer is injected globally by the GTM snippet
    (window.dataLayer ??= []).push(event);
  } catch {
    // Silently fail — never block the user action on analytics failure
  }
}
