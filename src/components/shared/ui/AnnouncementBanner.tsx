"use client";

/**
 * AnnouncementBanner.tsx — S21
 *
 * Collapsible promotion/announcement banner displayed above the topbar.
 *
 * Features:
 *   - Dismiss button — suppressed via localStorage for 24 hours
 *   - Configurable via `message` + `ctaLabel` + `ctaHref` props
 *   - Falls back to a default promotional copy when no props given
 *   - CSS-only slide-down entrance animation
 *   - data-testid attributes for Playwright E2E
 *   - Forest green background, gold accent CTA
 *   - Can accept content from CMS / platform settings (pass as props)
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

interface AnnouncementBannerProps {
  message?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** localStorage key for dismiss suppression — scoped per message  */
  dismissKey?: string;
  /** Duration in ms to suppress after dismiss (default 24h) */
  suppressMs?: number;
}

const DEFAULT_MESSAGE = "🎉 New Collection: AI-Measured Fits — Find your perfect match today";
const DEFAULT_CTA_LABEL = "Shop Now";
const DEFAULT_CTA_HREF = "/products";
const DEFAULT_DISMISS_KEY = "fashionistar_announcement_v1";
const DEFAULT_SUPPRESS_MS = 24 * 60 * 60 * 1000; // 24 hours

export function AnnouncementBanner({
  message = DEFAULT_MESSAGE,
  ctaLabel = DEFAULT_CTA_LABEL,
  ctaHref = DEFAULT_CTA_HREF,
  dismissKey = DEFAULT_DISMISS_KEY,
  suppressMs = DEFAULT_SUPPRESS_MS,
}: AnnouncementBannerProps) {
  const [visible, setVisible] = useState(false);

  // Only show after mount — check localStorage for suppression
  useEffect(() => {
    try {
      const item = localStorage.getItem(dismissKey);
      if (item) {
        const dismissedAt = parseInt(item, 10);
        if (Date.now() - dismissedAt < suppressMs) return; // still suppressed
      }
    } catch {
      // localStorage blocked — show banner anyway
    }
    setVisible(true);
  }, [dismissKey, suppressMs]);

  const handleDismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(dismissKey, String(Date.now()));
    } catch {
      // no-op
    }
  };

  if (!visible) return null;

  return (
    <div
      role="banner"
      aria-label="Promotional announcement"
      data-testid="announcement-banner"
      className="relative w-full bg-[#01454A] text-white py-2.5 px-4 flex items-center justify-center gap-3 text-sm font-raleway animate-[fadeSlideDown_0.4s_ease_forwards]"
    >
      {/* Message */}
      <span className="text-center leading-snug font-medium">
        {message}
        {ctaLabel && ctaHref && (
          <>
            {" "}
            <Link
              href={ctaHref}
              data-testid="announcement-cta"
              className="inline font-bold text-[#FDA600] underline-offset-2 hover:underline ml-1"
            >
              {ctaLabel} →
            </Link>
          </>
        )}
      </span>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        data-testid="announcement-dismiss"
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
