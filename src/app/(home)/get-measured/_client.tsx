"use client";
/**
 * @file _client.tsx
 * @description Client CTA boundary for /get-measured marketing page.
 *
 * No data collection happens on this page. The CTA redirects directly to
 * the dashboard scan page with an authentication gate:
 *  - Not logged in → /auth/login?returnUrl=/client/dashboard/measurements/scan
 *  - Logged in    → /client/dashboard/measurements/scan
 */

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/auth.store";

const SCAN_PATH = "/client/dashboard/measurements/scan";

interface GetMeasuredClientProps {
  /** Show only a CTA button (used across multiple sections of marketing page) */
  ctaOnly?: boolean;
  /** Custom CTA label */
  cta?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GetMeasuredClient({
  ctaOnly = false,
  cta = "Get My Free Measurements →",
}: GetMeasuredClientProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const handleClick = useCallback(() => {
    if (isAuthenticated) {
      router.push(SCAN_PATH);
    } else {
      router.push(`/auth/login?returnUrl=${encodeURIComponent(SCAN_PATH)}`);
    }
  }, [isAuthenticated, router]);

  if (ctaOnly) {
    return (
      <button
        id="get-measured-cta"
        onClick={handleClick}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-base
                   transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        style={{
          backgroundColor: "#FDA600",
          color:           "#111111",
          boxShadow:       "0 4px 20px rgba(253,166,0,0.35)",
        }}
        aria-label="Go to measurement scan"
      >
        {cta}
      </button>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className="rounded-[8px] px-4 py-3 font-satoshi text-base md:text-lg"
        style={{ backgroundColor: "#F8F5ED", color: "#5A6465" }}
      >
        Save your measurements once and reuse them across custom fashion orders
        for a smoother, more accurate fitting experience.
      </div>

      <button
        id="get-measured-inline-cta"
        onClick={handleClick}
        className="w-full rounded-xl font-semibold py-3.5 transition-all duration-200
                   flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
        style={{
          backgroundColor: "#FDA600",
          color:           "#111111",
          boxShadow:       "0 4px 20px rgba(253,166,0,0.30)",
        }}
      >
        Start AI Body Scan →
      </button>

      <p className="text-xs text-center" style={{ color: "#7A6B44" }}>
        🔒 No video stored • Only pose coordinates transmitted
      </p>
    </div>
  );
}

