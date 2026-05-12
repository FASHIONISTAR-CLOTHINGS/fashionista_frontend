/**
 * use-sessions — Telegram-Style Active Device Sessions
 *
 * Provides:
 *   useSessions()          — list all active sessions (current device highlighted)
 *   useRevokeSession()     — revoke a specific session by ID
 *   useRevokeOtherSessions() — "Sign out all other devices" (keep current)
 *
 * UI State Contract (mobile-first):
 *   - isLoading:     skeleton shown on first load (all card sizes)
 *   - isFetching:    subtle spinner in header (background refresh)
 *   - isError:       inline error banner (not full-page error)
 *   - isEmpty:       empty state (cannot happen in practice — always ≥1 current session)
 *   - sessions:      typed AuthSession[] from store shape
 *   - currentSession: the session where is_current === true
 *   - otherSessions:  all sessions where is_current === false
 *   - revokeCount:   number of other active sessions (badge on mobile)
 *
 * Mobile Responsiveness:
 *   - Optimistic update on revoke — card disappears immediately (no spinner)
 *   - On mobile, "Sign out all" button is full-width
 *   - Error toast is positioned bottom-center (above mobile nav bar)
 */
'use client';

import { useMemo } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  getSessions,
  revokeSession,
  revokeOtherSessions,
} from '@/features/auth/services/auth.service';
import type { AuthSession } from '@/features/auth/store/auth.store';

// ── Query key factory (stable references) ────────────────────────────────────
export const sessionKeys = {
  all: ['auth', 'sessions'] as const,
};

// ── useSessions ───────────────────────────────────────────────────────────────
export function useSessions() {
  const query = useQuery({
    queryKey: sessionKeys.all,
    queryFn:  getSessions,
    // Refetch every 60 seconds — keeps the active-device list fresh without
    // hammering the server. If the user's token expires, the interceptor handles it.
    refetchInterval:          60_000,
    refetchIntervalInBackground: false,
    // Stale after 30 seconds — instant render from cache, then silently refresh
    staleTime: 30_000,
    // Keep previous data visible while fetching (no layout shift on mobile)
    placeholderData: (prev) => prev,
  });

  const sessions: AuthSession[] = useMemo(
    () => (Array.isArray(query.data) ? query.data : []),
    [query.data],
  );

  const currentSession = useMemo(
    () => sessions.find((s) => s.is_current) ?? null,
    [sessions],
  );

  const otherSessions = useMemo(
    () => sessions.filter((s) => !s.is_current),
    [sessions],
  );

  return {
    // Raw query state
    isLoading:  query.isLoading,
    isFetching: query.isFetching,
    isError:    query.isError,
    error:      query.error,
    // Processed lists
    sessions,
    currentSession,
    otherSessions,
    // UI helpers
    isEmpty:      sessions.length === 0,
    revokeCount:  otherSessions.length, // badge number on mobile
    refetch:      query.refetch,
  };
}

// ── useRevokeSession ──────────────────────────────────────────────────────────
export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeSession,

    // Optimistic update: remove the card immediately — no spinner
    onMutate: async (sessionId: number) => {
      await queryClient.cancelQueries({ queryKey: sessionKeys.all });
      const previous = queryClient.getQueryData<AuthSession[]>(sessionKeys.all);
      queryClient.setQueryData<AuthSession[]>(sessionKeys.all, (old = []) =>
        old.filter((s) => s.id !== String(sessionId)),
      );
      return { previous };
    },

    // Roll back on error (network failure / 403)
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(sessionKeys.all, context.previous);
      }
    },

    // Always refetch after settle to sync with server truth
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: sessionKeys.all });
    },
  });
}

// ── useRevokeOtherSessions ────────────────────────────────────────────────────
export function useRevokeOtherSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeOtherSessions,

    // Optimistic: keep only current session in the list
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: sessionKeys.all });
      const previous = queryClient.getQueryData<AuthSession[]>(sessionKeys.all);
      queryClient.setQueryData<AuthSession[]>(sessionKeys.all, (old = []) =>
        old.filter((s) => s.is_current),
      );
      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(sessionKeys.all, context.previous);
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: sessionKeys.all });
    },
  });
}
