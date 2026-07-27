"use client";

/**
 * @file MarketingContext.tsx
 * @description Cross-page marketing infrastructure context.
 *
 * Provides shared state for:
 *   - Active urgency timers (flash sale, reservation)
 *   - Social proof counters (viewing now, recently sold)
 *   - Announcement bar state (dismissible, rotating messages)
 *   - Cross-page coupon state (exit-intent coupons, seasonal offers)
 *
 * Psychological triggers:
 *   - Consistency: Same urgency messaging across pages
 *   - Reciprocity: Coupon state persists across navigation
 *   - Social Proof: Live counters shared across components
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface MarketingState {
  activeCoupon: string | null;
  urgencyLevel: "none" | "low" | "medium" | "high";
  announcementDismissed: boolean;
  flashSaleEndsAt: number | null;
  viewingNowCount: number;
  recentlySoldCount: number;
}

interface MarketingContextValue extends MarketingState {
  setActiveCoupon: (code: string | null) => void;
  setUrgencyLevel: (level: MarketingState["urgencyLevel"]) => void;
  dismissAnnouncement: () => void;
  setFlashSaleEndsAt: (timestamp: number | null) => void;
  setViewingNowCount: (count: number) => void;
  setRecentlySoldCount: (count: number) => void;
}

const MarketingContext = createContext<MarketingContextValue | null>(null);

const ANNOUNCEMENT_KEY = "fashionistar_announcement_dismissed";
const COUPON_KEY = "fashionistar_active_coupon";

export function MarketingProvider({ children }: { children: ReactNode }) {
  const [activeCoupon, setActiveCouponState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(COUPON_KEY);
  });
  const [urgencyLevel, setUrgencyLevel] = useState<MarketingState["urgencyLevel"]>("none");
  const [announcementDismissed, setAnnouncementDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean(sessionStorage.getItem(ANNOUNCEMENT_KEY));
  });
  const [flashSaleEndsAt, setFlashSaleEndsAt] = useState<number | null>(null);
  const [viewingNowCount, setViewingNowCount] = useState(0);
  const [recentlySoldCount, setRecentlySoldCount] = useState(0);

  const setActiveCoupon = useCallback((code: string | null) => {
    setActiveCouponState(code);
    if (typeof window !== "undefined") {
      if (code) {
        sessionStorage.setItem(COUPON_KEY, code);
      } else {
        sessionStorage.removeItem(COUPON_KEY);
      }
    }
  }, []);

  const dismissAnnouncement = useCallback(() => {
    setAnnouncementDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(ANNOUNCEMENT_KEY, "1");
    }
  }, []);

  const value: MarketingContextValue = {
    activeCoupon,
    urgencyLevel,
    announcementDismissed,
    flashSaleEndsAt,
    viewingNowCount,
    recentlySoldCount,
    setActiveCoupon,
    setUrgencyLevel,
    dismissAnnouncement,
    setFlashSaleEndsAt,
    setViewingNowCount,
    setRecentlySoldCount,
  };

  return <MarketingContext.Provider value={value}>{children}</MarketingContext.Provider>;
}

export function useMarketingContext() {
  const ctx = useContext(MarketingContext);
  if (!ctx) {
    throw new Error("useMarketingContext must be used within MarketingProvider");
  }
  return ctx;
}
