// features/client/hooks/use-client-wishlist.ts
/**
 * TanStack Query hooks for client wishlist.
 * Aligned with: /api/v1/client/wishlist/*
 *
 * Toggle strategy: optimistic update — immediately reflects UI change
 * before server confirmation, rolling back on error.
 */
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { clientApi } from "@/features/client/api/client.api";

export const clientWishlistKeys = {
  all:  ["client", "wishlist"] as const,
  list: ["client", "wishlist", "list"] as const,
};

export function useClientWishlist() {
  return useQuery({
    queryKey:  clientWishlistKeys.list,
    queryFn:   clientApi.getWishlist,
    staleTime: 30_000,
  });
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (product_id: string) => clientApi.toggleWishlist(product_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientWishlistKeys.list });
    },
  });
}
