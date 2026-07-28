"use client";

/**
 * @file BackInStockToggle.tsx
 * @description Toggle button for back-in-stock notifications on out-of-stock wishlist items.
 *
 * Psychological triggers:
 *   - Loss Aversion: "Don't miss out — get notified"
 *   - Commitment: User opts in to receive alerts
 */

import { useState } from "react";
import { Bell, BellRing, Loader2 } from "lucide-react";
import { apiAsync } from "@/core/api/client.async";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface BackInStockToggleProps {
  productSlug: string;
  productTitle: string;
}

export function BackInStockToggle({ productSlug, productTitle }: BackInStockToggleProps) {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const accessToken = useAuthStore((s) => s.accessToken);
  const router = useRouter();

  const handleToggle = async () => {
    if (!accessToken) {
      router.push(`/auth/sign-in?returnUrl=/wishlist`);
      return;
    }

    setLoading(true);
    const wasSubscribed = subscribed;
    setSubscribed(!wasSubscribed);

    try {
      if (wasSubscribed) {
        await apiAsync.delete(`products/${productSlug}/stock-alert/`, { json: {} });
        toast.success(`Stopped alerts for ${productTitle}`);
      } else {
        await apiAsync.post(`products/${productSlug}/stock-alert/`, { json: {} });
        toast.success(`We'll notify you when ${productTitle} is back in stock! 🔔`);
      }
    } catch {
      setSubscribed(wasSubscribed);
      toast.error("Could not update alert preference. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 disabled:opacity-50 ${
        subscribed
          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
          : "border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))]"
      }`}
      aria-pressed={subscribed}
      aria-label={subscribed ? `Disable back-in-stock alert for ${productTitle}` : `Enable back-in-stock alert for ${productTitle}`}
      data-testid="back-in-stock-toggle"
    >
      {loading ? (
        <Loader2 size={12} className="animate-spin" />
      ) : subscribed ? (
        <BellRing size={12} />
      ) : (
        <Bell size={12} />
      )}
      {subscribed ? "Alert on" : "Notify me"}
    </button>
  );
}
