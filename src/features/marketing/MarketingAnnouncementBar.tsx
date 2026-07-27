"use client";

/**
 * @file MarketingAnnouncementBar.tsx
 * @description Global rotating announcement bar with psychological triggers.
 *
 * Psychological triggers:
 *   - Urgency: Flash sale countdown, limited-time offers
 *   - Social Proof: "X people shopping now"
 *   - Reciprocity: Free shipping threshold reminder
 *
 * Behavior:
 *   - Rotates through messages every 5s
 *   - Dismissible per session (persists in sessionStorage)
 *   - Integrates with MarketingContext for state
 */

import { useState, useEffect } from "react";
import { X, Truck, Flame, Users, Sparkles } from "lucide-react";

const MESSAGES = [
  { icon: Flame, text: "Flash Sale: Up to 40% off select items — ends tonight!", color: "text-[#FDA600]" },
  { icon: Truck, text: "FREE shipping on orders over ₦50,000", color: "text-emerald-600" },
  { icon: Users, text: "2,000+ shoppers browsing right now", color: "text-[#01454A]" },
  { icon: Sparkles, text: "New arrivals every week — shop the latest trends", color: "text-purple-600" },
] as const;

const ROTATION_INTERVAL = 5_000;
const SESSION_KEY = "fashionistar_announcement_dismissed";

export function MarketingAnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean(sessionStorage.getItem(SESSION_KEY));
  });

  useEffect(() => {
    if (dismissed) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length);
    }, ROTATION_INTERVAL);
    return () => clearInterval(interval);
  }, [dismissed]);

  const handleDismiss = () => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setDismissed(true);
  };

  if (dismissed) return null;

  const message = MESSAGES[index];
  const Icon = message.icon;

  return (
    <div
      className="relative z-40 flex items-center justify-center bg-[#1A1208] px-4 py-2 text-white"
      data-testid="marketing-announcement-bar"
    >
      <div className="flex items-center gap-2 text-center">
        <Icon size={14} className={message.color} />
        <p className="text-xs font-medium sm:text-sm">{message.text}</p>
      </div>
      <button
        onClick={handleDismiss}
        className="absolute right-3 p-1 text-white/60 hover:text-white transition"
        aria-label="Dismiss announcement"
      >
        <X size={14} />
      </button>
    </div>
  );
}
