// features/client/hooks/use-client-reviews.ts
/**
 * TanStack Query hooks for client reviews.
 * Aligned with: /api/v1/client/reviews/create/ and /api/v1/home/reviews/<id>/
 */
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { clientApi } from "@/features/client/api/client.api";
import type { ReviewCreatePayload } from "@/features/client/types/client.types";

export const clientReviewKeys = {
  byProduct: (productId: string) => ["client", "reviews", productId] as const,
};

export function useProductReviews(productId: string) {
  return useQuery({
    queryKey:  clientReviewKeys.byProduct(productId),
    queryFn:   () => clientApi.getProductReviews(productId),
    staleTime: 60_000,
    enabled:   !!productId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReviewCreatePayload) => clientApi.createReview(payload),
    onSuccess: (_data, { product_id }) => {
      queryClient.invalidateQueries({ queryKey: clientReviewKeys.byProduct(product_id) });
    },
  });
}
