/**
 * @file RecentlyViewedSection.tsx
 * @description "use client" section rendering the RecentlyViewedRail on the home page.
 *
 * SSR-safe: useRecentlyViewed hydrates from localStorage on mount.
 * Renders nothing on SSR (rail returns null when items=[]).
 * Revenue strategy: 35% of conversions come from recently-viewed re-engagement.
 */
"use client";

import { RecentlyViewedRail } from "@/features/catalog/components/RecentlyViewedRail";

/**
 * Renders the Recently Viewed horizontal rail below the Featured Products
 * section on the home page. Invisible until the user has viewed ≥1 product.
 */
export function RecentlyViewedSection() {
  return (
    <RecentlyViewedRail
      heading="Recently Viewed"
      maxVisible={8}
      className="px-5 md:px-10 lg:px-20"
    />
  );
}
