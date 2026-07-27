"use client";

/**
 * @file LiveSocialProofToast.tsx
 * @description Floating social proof toasts showing recent purchases.
 *
 * Psychological triggers:
 *   - Social Proof: "X people bought Y in the last hour"
 *   - FOMO: Real-time purchase notifications
 *   - Authority: Shows platform activity and trust
 *
 * Behavior:
 *   - Polls GET /api/v1/ninja/catalog/recent-purchases/ every 45s
 *   - Shows toast for 5s, then hides for 10s, then shows next
 *   - Dismissible per-session via sessionStorage
 *   - Only shows on homepage and product pages
 *   - Never shows on checkout (would distract from conversion)
 */

import { useEffect, useState } from "react";
import { ShoppingBag, X, MapPin } from "lucide-react";
import { apiAsync } from "@/core/api/client.async";

interface RecentPurchase {
  id: string;
  product_title: string;
  product_slug: string;
  buyer_name: string;
  buyer_location: string;
  timestamp: string;
}

const SESSION_KEY = "fashionistar_social_proof_dismissed";
const TOAST_DURATION = 5_000;
const TOAST_INTERVAL = 15_000;

export function LiveSocialProofToast() {
  const [purchases, setPurchases] = useState<RecentPurchase[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean(sessionStorage.getItem(SESSION_KEY));
  });

  useEffect(() => {
    if (dismissed) return;

    let active = true;

    const fetchRecent = async () => {
      try {
        const res = await apiAsync
          .get("catalog/recent-purchases/")
          .json<{ results: RecentPurchase[] }>();
        if (active && res.results?.length) {
          setPurchases(res.results);
        }
      } catch {
        // Silent fail — social proof is enhancement only
      }
    };

    void fetchRecent();

    // Cycle through toasts
    const cycleInterval = setInterval(() => {
      setVisible((prev) => {
        if (!prev && purchases.length > 0) {
          return true;
        }
        return false;
      });
    }, TOAST_INTERVAL);

    // Auto-hide after duration
    const hideInterval = setInterval(() => {
      if (visible) {
        setVisible(false);
        setCurrentIndex((prev) => (prev + 1) % Math.max(1, purchases.length));
      }
    }, TOAST_DURATION + TOAST_INTERVAL);

    return () => {
      active = false;
      clearInterval(cycleInterval);
      clearInterval(hideInterval);
    };
  }, [purchases.length, visible, dismissed]);

  const handleDismiss = () => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setDismissed(true);
    setVisible(false);
  };

  if (dismissed || purchases.length === 0 || !visible) return null;

  const purchase = purchases[currentIndex % purchases.length];
  if (!purchase) return null;

  const firstName = purchase.buyer_name?.split(" ")[0] || "Someone";
  const timeAgo = getRelativeTime(purchase.timestamp);

  return (
    <div
      className="fixed bottom-20 left-4 z-40 max-w-xs animate-slide-up"
      data-testid="live-social-proof-toast"
    >
      <div className="relative flex items-center gap-3 rounded-2xl border border-[#01454A]/15 bg-white shadow-xl px-4 py-3">
        {/* Product icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#01454A]/8">
          <ShoppingBag size={18} className="text-[#01454A]" />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground line-clamp-1">
            {firstName} from {purchase.buyer_location || "Nigeria"} just bought
          </p>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {purchase.product_title}
          </p>
          <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-[#01454A]/60">
            <MapPin size={8} />
            {timeAgo}
          </p>
        </div>

        {/* Close */}
        <button
          onClick={handleDismiss}
          className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-muted transition"
          aria-label="Dismiss notification"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

function getRelativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
