"use client";

/**
 * @file UrgencyBanner.tsx
 * @description Rotating scarcity messages in a thin dismissible bar above hero.
 *
 * Psychological triggers:
 *   - Urgency: Flash sale countdown, low stock alerts
 *   - Scarcity: Products selling out fast
 *   - Reciprocity: Free shipping incentive
 *
 * Behavior:
 *   - Rotates through 3 message types every 5 seconds
 *   - Dismissible for current session (sessionStorage)
 *   - Thin bar, non-intrusive
 */

import { useEffect, useState } from "react";
import { Zap, Flame, Truck, X } from "lucide-react";

const SESSION_KEY = "fashionistar_urgency_banner_dismissed";
const ROTATION_INTERVAL = 5_000;

interface UrgencyMessage {
  icon: typeof Zap;
  text: string;
  bg: string;
  textCls: string;
}

const MESSAGES: UrgencyMessage[] = [
  {
    icon: Zap,
    text: "⚡ Flash Sale live — Save up to 40% on select items",
    bg: "bg-gradient-to-r from-[#FDA600] to-[#FDA600]/80",
    textCls: "text-black",
  },
  {
    icon: Flame,
    text: "🔥 47 products selling out fast — Shop now before they're gone",
    bg: "bg-gradient-to-r from-[#01454A] to-[#01454A]/80",
    textCls: "text-white",
  },
  {
    icon: Truck,
    text: "🎁 Free shipping on orders above ₦50,000",
    bg: "bg-gradient-to-r from-[#01454A]/90 to-[#01454A]/70",
    textCls: "text-white",
  },
];

export function UrgencyBanner() {
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDismissed(Boolean(sessionStorage.getItem(SESSION_KEY)));
  }, []);

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

  const msg = MESSAGES[index];
  const Icon = msg.icon;

  return (
    <div
      className={`relative z-30 flex items-center justify-center px-4 py-2 ${msg.bg} transition-all duration-300`}
      data-testid="urgency-banner"
    >
      <div className={`flex items-center gap-2 ${msg.textCls}`}>
        <Icon size={14} className="shrink-0" />
        <span className="text-xs font-semibold sm:text-sm">{msg.text}</span>
      </div>
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 opacity-70 hover:opacity-100 transition"
        aria-label="Dismiss banner"
      >
        <X size={14} className={msg.textCls} />
      </button>
    </div>
  );
}
