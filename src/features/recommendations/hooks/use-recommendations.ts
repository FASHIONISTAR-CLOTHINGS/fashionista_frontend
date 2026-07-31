/**
 * @file use-recommendations.ts
 * @description TanStack Query hook for AI-powered product recommendations.
 *
 * Powers:
 *   - Homepage "For You" rail
 *   - PDP "Complete your look" cross-sell
 *   - Cart upsell carousel
 *   - "Similar products" on PDP
 */

import { useQuery } from "@tanstack/react-query";
import { recommendationsApi } from "../api/recommendations.api";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { HomepageProductCard } from "@/features/catalog/types/catalog.types";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function useForYouRecommendations(limit = 8) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<HomepageProductCard[]>({
    queryKey: ["recommendations", "for-you", limit],
    queryFn: () => recommendationsApi.getForYou(limit),
    enabled: isAuthenticated,
    staleTime: STALE_TIME,
  });
}

export function useCrossSellRecommendations(slug: string | null, limit = 4) {
  return useQuery<HomepageProductCard[]>({
    queryKey: ["recommendations", "cross-sell", slug, limit],
    queryFn: () => recommendationsApi.getCrossSell(slug!, limit),
    enabled: !!slug,
    staleTime: STALE_TIME,
  });
}

export function useSimilarRecommendations(slug: string | null, limit = 6) {
  return useQuery<HomepageProductCard[]>({
    queryKey: ["recommendations", "similar", slug, limit],
    queryFn: () => recommendationsApi.getSimilar(slug!, limit),
    enabled: !!slug,
    staleTime: STALE_TIME,
  });
}

export function useTrendingRecommendations(limit = 8) {
  return useQuery<HomepageProductCard[]>({
    queryKey: ["recommendations", "trending", limit],
    queryFn: () => recommendationsApi.getTrending(limit),
    staleTime: STALE_TIME,
  });
}
