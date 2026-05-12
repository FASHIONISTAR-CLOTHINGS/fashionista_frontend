/**
 * @module use-network-status
 *
 * Reactive online/offline detector built on the browser `navigator.onLine`
 * API and `online` / `offline` window events.
 *
 * Usage:
 *   const { isOnline, wasOffline } = useNetworkStatus();
 *
 *   // With automatic toast notification:
 *   useNetworkStatus({ notifyOnReconnect: true });
 *
 * Notes:
 *   - `wasOffline` is true only during the FIRST render cycle after reconnection.
 *     Use it to trigger a data refetch after coming back online.
 *   - SSR-safe: defaults to `true` (online) on the server.
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseNetworkStatusOptions {
  /**
   * When true, fires `onReconnect` callback when the browser goes
   * from offline back to online (e.g., to trigger a query refetch).
   */
  onReconnect?: () => void;
  /**
   * When true, fires `onOffline` callback when the browser loses connectivity.
   */
  onOffline?: () => void;
}

export interface UseNetworkStatusReturn {
  /** Whether the browser currently has network access. */
  isOnline: boolean;
  /**
   * True for one render cycle immediately after coming back online.
   * Useful for triggering "reconnected — refreshing data…" banners.
   */
  wasOffline: boolean;
}

/**
 * Returns reactive online/offline connectivity state.
 *
 * Args:
 *   options: Optional callbacks for reconnect/offline events.
 *
 * Returns:
 *   `{ isOnline, wasOffline }` — reactive connectivity state.
 */
export function useNetworkStatus({
  onReconnect,
  onOffline,
}: UseNetworkStatusOptions = {}): UseNetworkStatusReturn {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState(false);
  const wasOfflineRef = useRef(false);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    if (wasOfflineRef.current) {
      setWasOffline(true);
      // Reset after one render cycle
      setTimeout(() => setWasOffline(false), 0);
      onReconnect?.();
    }
    wasOfflineRef.current = false;
  }, [onReconnect]);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    wasOfflineRef.current = true;
    onOffline?.();
  }, [onOffline]);

  useEffect(() => {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return { isOnline, wasOffline };
}
