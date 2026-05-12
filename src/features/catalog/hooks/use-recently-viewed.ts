/**
 * @file use-recently-viewed.ts
 * @description localStorage ring-buffer tracking the last 12 viewed product IDs.
 *
 * Revenue strategy: 35% of e-commerce conversions come from recently-viewed items.
 *
 * Data format: JSON array of { id, slug, title, coverUrl, price, viewedAt }
 * Eviction: 7-day TTL per item; buffer cap of 12.
 */
"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "fashionistar_recently_viewed";
const MAX_ITEMS = 12;
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface RecentlyViewedItem {
  id: string;
  slug: string;
  title: string;
  coverUrl: string;
  price: string;
  viewedAt: number;
}

/**
 * Reads the recently viewed ring-buffer from localStorage.
 * Evicts items older than 7 days.
 */
function readBuffer(): RecentlyViewedItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: RecentlyViewedItem[] = JSON.parse(raw);
    const now = Date.now();
    return parsed.filter((item) => now - item.viewedAt < TTL_MS);
  } catch {
    return [];
  }
}

/**
 * Writes the ring-buffer to localStorage, capping at MAX_ITEMS.
 */
function writeBuffer(items: RecentlyViewedItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {
    // noop — localStorage quota exceeded or unavailable
  }
}

/**
 * Hook for reading and recording recently viewed products.
 *
 * Returns:
 *   items:    The sorted list of recently viewed products (newest first).
 *   trackView: Call this on product detail page view with the product metadata.
 */
export function useRecentlyViewed(): {
  items: RecentlyViewedItem[];
  trackView: (product: Omit<RecentlyViewedItem, "viewedAt">) => void;
} {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  // Hydrate on mount (SSR-safe)
  useEffect(() => {
    setItems(readBuffer());
  }, []);

  const trackView = useCallback(
    (product: Omit<RecentlyViewedItem, "viewedAt">) => {
      setItems((prev) => {
        const entry: RecentlyViewedItem = {
          ...product,
          viewedAt: Date.now(),
        };
        // Remove duplicates, prepend newest, cap at MAX_ITEMS
        const filtered = prev.filter((p) => p.id !== product.id);
        const next = [entry, ...filtered].slice(0, MAX_ITEMS);
        writeBuffer(next);
        return next;
      });
    },
    [],
  );

  return { items, trackView };
}
