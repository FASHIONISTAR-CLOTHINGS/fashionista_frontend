// features/client/hooks/use-client-wishlist.ts
/**
 * TanStack Query hooks for client wishlist — 2027 Edition.
 * Aligned with: /api/v1/client/wishlist/*
 *
 * Changes (2027 modernization):
 *  • useToggleWishlist: full optimistic pattern (onMutate snapshot → onError
 *    rollback → onSettled invalidate). Heart icon flips instantly, not after a
 *    full network round-trip.
 *  • useWishlistItemIds: derived Set<string> of product IDs. Product cards
 *    subscribe to this instead of the full list — avoids unnecessary re-renders
 *    on unrelated wishlist mutations.
 *  • usePrefetchWishlist: intent-based prefetch (wire to hover/focus on the
 *    wishlist nav icon). Fills the cache before the user navigates.
 */
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { clientApi } from "@/features/client/api/client.api";
import { useAuth } from "@/features/auth/hooks/useAuth";

// ── Query keys ────────────────────────────────────────────────────────────────

export const clientWishlistKeys = {
  all:  ["client", "wishlist"] as const,
  list: ["client", "wishlist", "list"] as const,
};

// ── Types ─────────────────────────────────────────────────────────────────────

/** Minimal shape of a wishlist row — used internally within this module. */
type WishlistRow = {
  id: string;
  product_id: string;
  [key: string]: unknown;
};

interface UseClientWishlistOptions {
  enabled?: boolean;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

/** Fetch the full authenticated wishlist. */
export function useClientWishlist(options?: UseClientWishlistOptions) {
  const { isAuthenticated } = useAuth();
  const isEnabled = options?.enabled ?? true;

  return useQuery({
    queryKey:  clientWishlistKeys.list,
    queryFn:   clientApi.getWishlist,
    staleTime: 30_000,
    enabled:   isAuthenticated && isEnabled,
  });
}

/**
 * Derived hook: returns a Set of product IDs currently in the wishlist.
 *
 * Product cards subscribe to this instead of the full list, preventing
 * unnecessary re-renders when unrelated wishlist fields change.
 *
 * Returns an empty Set when the wishlist is not yet loaded or the user
 * is not authenticated.
 */
export function useWishlistItemIds(): Set<string> {
  const { data } = useClientWishlist();
  if (!data || !Array.isArray(data)) return new Set<string>();
  return new Set<string>(
    (data as unknown as WishlistRow[]).map((item) => item.product_id),
  );
}

/**
 * Prefetch wishlist on user intent (hover/focus on wishlist nav icon).
 * Fills the TanStack Query cache so navigation to the wishlist page is instant.
 */
export function usePrefetchWishlist() {
  const qc = useQueryClient();
  const { isAuthenticated } = useAuth();

  return () => {
    if (!isAuthenticated) return;
    void qc.prefetchQuery({
      queryKey: clientWishlistKeys.list,
      queryFn:  clientApi.getWishlist,
      staleTime: 30_000,
    });
  };
}

/**
 * Optimistic wishlist toggle.
 *
 * The heart icon flips INSTANTLY via an optimistic cache update.
 * If the server rejects, the icon reverts and a toast explains why.
 *
 * Optimistic strategy:
 *  1. onMutate  → snapshot the list, toggle the product_id in-cache.
 *  2. onError   → restore the snapshot.
 *  3. onSettled → always invalidate to reconcile with server state.
 */
export function useToggleWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (product_id: string) => clientApi.toggleWishlist(product_id),

    onMutate: async (product_id) => {
      // 1. Cancel any outgoing refetches to avoid overwriting optimistic state
      await queryClient.cancelQueries({ queryKey: clientWishlistKeys.list });

      // 2. Snapshot for rollback
      const previousWishlist = queryClient.getQueryData<WishlistRow[]>(
        clientWishlistKeys.list,
      );

      // 3. Optimistically toggle: add if absent, remove if present
      queryClient.setQueryData<WishlistRow[]>(
        clientWishlistKeys.list,
        (old) => {
          if (!old) return old;
          const exists = old.some((item) => item.product_id === product_id);
          if (exists) {
            return old.filter((item) => item.product_id !== product_id);
          }
          return [
            ...old,
            {
              id: `optimistic-${Date.now()}`,
              product_id,
            },
          ];
        },
      );

      return { previousWishlist };
    },

    onError: (_err, _product_id, ctx) => {
      if (ctx?.previousWishlist !== undefined) {
        queryClient.setQueryData(clientWishlistKeys.list, ctx.previousWishlist);
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: clientWishlistKeys.list });
    },
  });
}
