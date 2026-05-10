/**
 * use-login-events — Binance-Style Login Activity Feed
 *
 * Provides:
 *   useLoginEvents()  — paginated login event history (latest first)
 *
 * UI State Contract (mobile-first):
 *   - isLoading:       full skeleton on first load
 *   - isFetching:      subtle header spinner (background refresh)
 *   - isError:         inline error banner
 *   - events:          typed LoginEvent[] newest-first
 *   - successCount:    number of successful logins (green badge)
 *   - failureCount:    number of failed attempts (red badge — security signal)
 *   - hasAnomalies:    true if any failure in the last 24 hours (alert banner)
 *   - lastSuccessAt:   most recent successful login timestamp (ISO string)
 *
 * Mobile:
 *   - Feed renders as a vertical timeline card list (full-width on mobile)
 *   - Security alert banner is sticky at top on mobile viewport
 *   - Refetches every 5 minutes — login events are append-only and low-volume
 */
'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLoginEvents } from '@/features/auth/services/auth.service';
import type { LoginEvent } from '@/features/auth/store/auth.store';

// ── Query key factory ────────────────────────────────────────────────────────
export const loginEventKeys = {
  all: ['auth', 'login-events'] as const,
};

// ── Anomaly detection threshold ──────────────────────────────────────────────
const ANOMALY_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

// ── useLoginEvents ───────────────────────────────────────────────────────────
export function useLoginEvents() {
  const query = useQuery({
    queryKey: loginEventKeys.all,
    queryFn:  getLoginEvents,
    // Login events are immutable history — 5 minute stale time is aggressive enough
    staleTime:          5 * 60_000,
    refetchInterval:    5 * 60_000,
    refetchIntervalInBackground: false,
    // Keep previous data during refresh (no list flash on mobile)
    placeholderData: (prev) => prev,
  });

  const events: LoginEvent[] = useMemo(
    () => (Array.isArray(query.data) ? query.data : []),
    [query.data],
  );

  // ── Derived UI state ──────────────────────────────────────────────────────

  const successCount = useMemo(
    () => events.filter((e) => e.success).length,
    [events],
  );

  const failureCount = useMemo(
    () => events.filter((e) => !e.success).length,
    [events],
  );

  /** True when ANY failed login occurred in the last 24 hours */
  const hasAnomalies = useMemo(() => {
    const threshold = (query.dataUpdatedAt || 0) - ANOMALY_WINDOW_MS;
    return events.some(
      (e) => !e.success && new Date(e.timestamp).getTime() > threshold,
    );
  }, [events, query.dataUpdatedAt]);

  /** Most recent successful login ISO timestamp — shown as "Last login: ..." */
  const lastSuccessAt = useMemo(() => {
    const latest = events.find((e) => e.success);
    return latest?.timestamp ?? null;
  }, [events]);

  /** Newest 10 events — the mobile feed shows a summarised view */
  const recentEvents = useMemo(() => events.slice(0, 10), [events]);

  return {
    // Raw query state
    isLoading:  query.isLoading,
    isFetching: query.isFetching,
    isError:    query.isError,
    error:      query.error,
    // Full list
    events,
    // Derived
    successCount,
    failureCount,
    hasAnomalies,
    lastSuccessAt,
    recentEvents,
    isEmpty: events.length === 0,
    refetch: query.refetch,
  };
}
