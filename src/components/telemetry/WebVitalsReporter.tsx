/**
 * WebVitalsReporter.tsx — Core Web Vitals telemetry client.
 *
 * "use client" — useReportWebVitals requires client-side execution.
 *
 * Phase 4 — SEO & Performance (FASHIONISTAR Enterprise Blueprint)
 *
 * Captures real-user Core Web Vitals metrics (LCP, INP, CLS, FCP, TTFB) and
 * sends them to our internal telemetry edge handler via sendBeacon (fire-and-
 * forget, non-blocking). The edge handler proxies to the Django Ninja backend
 * which logs SLA breaches to PostgreSQL.
 *
 * SLA Targets:
 *   LCP  < 2,500ms  (Good = < 1,000ms)
 *   INP  <   200ms  (Good = <  75ms)
 *   CLS  <     0.1  (Good = <  0.05)
 *   FCP  < 1,800ms
 *   TTFB <   800ms
 *
 * Usage — add once to the root layout as a client component:
 *   import { WebVitalsReporter } from "@/components/telemetry/WebVitalsReporter";
 *   <WebVitalsReporter />
 */
"use client";

import { useReportWebVitals } from "next/web-vitals";

/** Endpoint on the Next.js edge that proxies metrics to Django. */
const VITALS_ENDPOINT = "/api/telemetry/vitals";

/** Whether we should send vitals in this environment. */
const ENABLED = process.env.NEXT_PUBLIC_TELEMETRY_ENABLED !== "false";

/**
 * Client component that hooks into Next.js web vitals reporting.
 * Renders nothing — purely a side-effect hook registrar.
 */
export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    if (!ENABLED) return;

    const payload = {
      id: metric.id,
      name: metric.name,
      label: metric.label,
      value: metric.value,
      rating: metric.rating, // "good" | "needs-improvement" | "poor"
      path: typeof window !== "undefined" ? window.location.pathname : "/",
      navigationType: metric.navigationType,
    };

    // sendBeacon is fire-and-forget and non-blocking — preferred for analytics.
    // Falls back to fetch() when sendBeacon is unavailable (old iOS browsers).
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.sendBeacon === "function"
    ) {
      const blob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      navigator.sendBeacon(VITALS_ENDPOINT, blob);
    } else {
      // Non-critical: best-effort fallback with keepalive so the browser doesn't
      // cancel in-flight requests on page unload.
      fetch(VITALS_ENDPOINT, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      }).catch(() => {
        // Swallow — telemetry must never break user experience.
      });
    }
  });

  return null;
}
