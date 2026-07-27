"use client";

/**
 * @file AIPersonalizedGreeting.tsx
 * @description AI-personalized greeting banner for homepage.
 *
 * Psychological triggers:
 *   - Personalization: Greets user by name or browsing history
 *   - Reciprocity: "Welcome back" makes user feel valued
 *   - Authority: AI-powered recommendations feel intelligent
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, TrendingUp, Clock } from "lucide-react";

interface AIPersonalizedGreetingProps {
  userName?: string | null;
  recentlyViewedCount?: number;
}

function computeGreeting(userName?: string | null, recentlyViewedCount = 0) {
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  if (userName) {
    return {
      greeting: `${timeGreeting}, ${userName}!`,
      subtext: "Your personalized fashion feed is ready to explore.",
      icon: "sparkles" as const,
      link: null as { href: string; label: string } | null,
    };
  }
  if (recentlyViewedCount > 0) {
    return {
      greeting: "Pick up where you left off",
      subtext: `You have ${recentlyViewedCount} recently viewed item${recentlyViewedCount !== 1 ? "s" : ""} waiting.`,
      icon: "clock" as const,
      link: { href: "/products", label: "Continue browsing \u2192" },
    };
  }
  return {
    greeting: "Discover fashion tailored to you",
    subtext: "AI-powered recommendations based on your unique style.",
    icon: "trending" as const,
    link: { href: "/get-measured", label: "Get your AI measurement \u2192" },
  };
}

export function AIPersonalizedGreeting({
  userName,
  recentlyViewedCount = 0,
}: AIPersonalizedGreetingProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="mx-5 md:mx-10 lg:mx-20 mt-6 rounded-2xl bg-gradient-to-r from-[#01454A]/5 to-[#FDA600]/5 border border-[#01454A]/10 px-5 py-4 flex items-center gap-4"
        data-testid="ai-personalized-greeting"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
          <Sparkles size={18} className="text-[#01454A]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground">Discover fashion tailored to you</p>
          <p className="text-xs text-muted-foreground mt-0.5">AI-powered recommendations based on your unique style.</p>
        </div>
      </div>
    );
  }

  const { greeting, subtext, icon, link } = computeGreeting(userName, recentlyViewedCount);
  const Icon = icon === "sparkles" ? Sparkles : icon === "trending" ? TrendingUp : Clock;

  return (
    <div
      className="mx-5 md:mx-10 lg:mx-20 mt-6 rounded-2xl bg-gradient-to-r from-[#01454A]/5 to-[#FDA600]/5 border border-[#01454A]/10 px-5 py-4 flex items-center gap-4"
      data-testid="ai-personalized-greeting"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
        <Icon size={18} className="text-[#01454A]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground">{greeting}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{subtext}</p>
      </div>
      {link && (
        <Link
          href={link.href}
          className="shrink-0 text-xs font-semibold text-[#01454A] hover:underline whitespace-nowrap"
        >
          {link.label}
        </Link>
      )}
    </div>
  );
}
