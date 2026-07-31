/**
 * @file recommendations.api.ts
 * @description API layer for AI-powered product recommendations.
 *
 * Endpoints:
 *   - GET /api/v1/ninja/recommendations/for-you/  → Personalized for user
 *   - GET /api/v1/ninja/recommendations/cross-sell/{slug}/  → Cross-sell for PDP
 *   - GET /api/v1/ninja/recommendations/similar/{slug}/  → Similar products
 *   - GET /api/v1/ninja/recommendations/trending/  → Platform-wide trending
 */

import { apiAsync } from "@/core/api/client.async";
import type { HomepageProductCard } from "@/features/catalog/types/catalog.types";

export interface RecommendationBundle {
  for_you: HomepageProductCard[];
  cross_sell: HomepageProductCard[];
  similar: HomepageProductCard[];
  trending: HomepageProductCard[];
}

const EMPTY_BUNDLE: RecommendationBundle = {
  for_you: [],
  cross_sell: [],
  similar: [],
  trending: [],
};

export const recommendationsApi = {
  async getForYou(limit = 8): Promise<HomepageProductCard[]> {
    try {
      const res = await apiAsync
        .get(`recommendations/for-you/?limit=${limit}`)
        .json<{ results: HomepageProductCard[] }>();
      return res.results ?? [];
    } catch {
      return [];
    }
  },

  async getCrossSell(slug: string, limit = 4): Promise<HomepageProductCard[]> {
    try {
      const res = await apiAsync
        .get(`recommendations/cross-sell/${slug}/?limit=${limit}`)
        .json<{ results: HomepageProductCard[] }>();
      return res.results ?? [];
    } catch {
      return [];
    }
  },

  async getSimilar(slug: string, limit = 6): Promise<HomepageProductCard[]> {
    try {
      const res = await apiAsync
        .get(`recommendations/similar/${slug}/?limit=${limit}`)
        .json<{ results: HomepageProductCard[] }>();
      return res.results ?? [];
    } catch {
      return [];
    }
  },

  async getTrending(limit = 8): Promise<HomepageProductCard[]> {
    try {
      const res = await apiAsync
        .get(`recommendations/trending/?limit=${limit}`)
        .json<{ results: HomepageProductCard[] }>();
      return res.results ?? [];
    } catch {
      return [];
    }
  },

  async getBundle(): Promise<RecommendationBundle> {
    try {
      const res = await apiAsync
        .get("recommendations/bundle/")
        .json<RecommendationBundle>();
      return { ...EMPTY_BUNDLE, ...res };
    } catch {
      return EMPTY_BUNDLE;
    }
  },
};
