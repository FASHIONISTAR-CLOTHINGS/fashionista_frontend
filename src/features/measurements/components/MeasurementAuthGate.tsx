"use client";
/**
 * @file MeasurementAuthGate.tsx
 * @description TASK-029: Authentication gate for dashboard measurement actions.
 *
 * Behavior:
 * - If session exists: renders children normally
 * - If no session: wraps children in a click interceptor that:
 *   1. Saves measurement_intent to sessionStorage
 *   2. Redirects to /login?redirect=/client/dashboard/measurements/new
 *
 * Design:
 * - Invisible wrapper — no visual change when authenticated
 * - Shows a subtle "Sign in to scan" overlay when unauthenticated
 * - Forest Green CTA to login, Golden Yellow border on hover
 *
 * Post-login recovery:
 * - Login success handler reads sessionStorage.fashionistar_measurement_intent
 * - Redirects back to the measurement flow with all pre-filled params
 *
 * Usage:
 *   <MeasurementAuthGate>
 *     <EnhancedMeasurementFlow ... />
 *   </MeasurementAuthGate>
 */

import { useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { AnimatePresence, motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MeasurementAuthGateProps {
  children: ReactNode;
  /** The URL to redirect back to after login */
  redirectUrl?: string;
  /** Extra params to preserve through the login redirect */
  params?: Record<string, string>;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MeasurementAuthGate({
  children,
  redirectUrl = "/client/dashboard/measurements/new",
  params = {},
  className = "",
}: MeasurementAuthGateProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();

  const handleGateClick = useCallback(() => {
    const fullUrl =
      Object.keys(params).length > 0
        ? `${redirectUrl}?${new URLSearchParams(params).toString()}`
        : redirectUrl;

    // Persist the intent so post-login handler can recover it
    try {
      sessionStorage.setItem(
        "fashionistar_measurement_intent",
        JSON.stringify({
          redirect:  fullUrl,
          params,
          timestamp: Date.now(),
        })
      );
    } catch {
      // sessionStorage unavailable (private browsing) — continue anyway
    }

    router.push(`/login?redirect=${encodeURIComponent(fullUrl)}`);
  }, [router, redirectUrl, params]);

  // Authenticated — render children normally (no gate)
  if (isAuthenticated) {
    return <div className={className}>{children}</div>;
  }

  // Unauthenticated — wrap with click interceptor overlay
  return (
    <div className={`relative ${className}`}>
      {/* Blur the children slightly to signal locked state */}
      <div className="pointer-events-none select-none" style={{ filter: "blur(2px)", opacity: 0.6 }}>
        {children}
      </div>

      {/* Gate overlay */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center
                     rounded-2xl z-10 gap-4"
          style={{
            backgroundColor: "rgba(10,20,14,0.85)",
            backdropFilter:  "blur(8px)",
            border:          "1px solid rgba(45,106,79,0.3)",
          }}
        >
          {/* Lock icon */}
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(45,106,79,0.2)", border: "2px solid rgba(45,106,79,0.4)" }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="#1A6B72"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          {/* Text */}
          <div className="text-center px-4">
            <h3 className="text-white font-bold text-lg">Sign In to Scan</h3>
            <p className="text-white/50 text-sm mt-1">
              Create a free account to save your measurements and use them for custom orders.
            </p>
          </div>

          {/* CTA */}
          <button
            id="measurement-auth-gate-cta"
            onClick={handleGateClick}
            className="rounded-xl font-semibold px-6 py-3 text-sm transition-all
                       hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: "#FDA600",
              color:           "#111111",
              boxShadow:       "0 4px 16px rgba(244,196,48,0.30)",
            }}
          >
            Sign in — It&apos;s Free
          </button>

          <p className="text-white/30 text-xs">
            Already have an account?{" "}
            <button
              onClick={handleGateClick}
              className="underline text-white/50 hover:text-white/80 transition"
            >
              Log in
            </button>
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
