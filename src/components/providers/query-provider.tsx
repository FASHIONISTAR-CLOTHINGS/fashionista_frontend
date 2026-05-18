"use client";
/**
 * TanStack Query Provider — Server State Management
 *
 * Wraps the app with QueryClientProvider.
 * QueryClient configured with enterprise defaults.
 *
 * Cart + Wishlist Persistence (2027 Edition):
 *   The QueryClient subscribes to its own cache via a MutationCache/QueryCache
 *   observer and writes cart + wishlist snapshots to sessionStorage whenever
 *   those queries settle successfully. On mount the provider hydratos those
 *   snapshots back as initialData so the cache is warm before any network
 *   request fires — eliminating the "empty badge on first render" flash.
 *
 * Why sessionStorage (not localStorage)?
 *   - sessionStorage is scoped to the browser tab. It auto-clears on tab close,
 *     so stale guest carts from a previous session never contaminate a fresh
 *     authenticated session opened in a new tab.
 *   - It is synchronous and available on the first render, unlike IndexedDB.
 *   - The cart payload is typically <10 KB — well within the 5 MB limit.
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

// ── Storage keys ──────────────────────────────────────────────────────────────
const CART_STORAGE_KEY    = "fashionistar:cart:v1";
const WISHLIST_STORAGE_KEY = "fashionistar:wishlist:v1";

// ── Helpers ───────────────────────────────────────────────────────────────────

function readStorage<T>(key: string): T | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return undefined;
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function writeStorage(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded or private mode — fail silently
  }
}

// ── QueryClient factory ───────────────────────────────────────────────────────

function makeQueryClient(): QueryClient {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        // Data is fresh for 1 minute — don't refetch if we just fetched
        staleTime: 60 * 1000,
        // Retry once on failure, except for auth / not-found errors
        retry: (failureCount, error: unknown) => {
          const status = (error as { response?: { status?: number } })
            ?.response?.status;
          if (status === 401 || status === 403 || status === 404)
            return false;
          return failureCount < 1;
        },
        // Refetch on window focus disabled (reduces noise on blur/focus cycles)
        refetchOnWindowFocus: false,
      },
      mutations: {
        // Don't retry mutations by default (idempotency concern)
        retry: false,
      },
    },
  });

  return client;
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());

  /**
   * Hydrate cart + wishlist from sessionStorage on first mount.
   * This runs once, synchronously before any useQuery fires, giving the
   * cart badge a non-undefined value on the very first render.
   */
  const hydrated = useRef(false);
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    const cachedCart     = readStorage<unknown>(CART_STORAGE_KEY);
    const cachedWishlist = readStorage<unknown>(WISHLIST_STORAGE_KEY);

    if (cachedCart) {
      queryClient.setQueryData(["cart", "detail"], cachedCart);
    }
    if (cachedWishlist) {
      queryClient.setQueryData(["client", "wishlist", "list"], cachedWishlist);
    }
  }, [queryClient]);

  /**
   * Subscribe to cache updates and persist cart + wishlist to sessionStorage
   * every time those queries receive fresh data from the server.
   * Uses the QueryCache observer API — no additional dependencies required.
   */
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== "updated") return;
      if (event.action.type !== "success") return;

      const key   = event.query.queryKey;
      const data  = event.action.data;

      // Persist cart snapshot
      if (
        Array.isArray(key) &&
        key[0] === "cart" &&
        key[1] === "detail"
      ) {
        writeStorage(CART_STORAGE_KEY, data);
      }

      // Persist wishlist snapshot
      if (
        Array.isArray(key) &&
        key[0] === "client" &&
        key[1] === "wishlist" &&
        key[2] === "list"
      ) {
        writeStorage(WISHLIST_STORAGE_KEY, data);
      }
    });

    return () => unsubscribe();
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
