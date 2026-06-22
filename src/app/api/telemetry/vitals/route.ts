/**
 * app/api/telemetry/vitals/route.ts — Next.js Edge Route Handler
 *
 * Phase 4 — SEO & Performance (FASHIONISTAR Enterprise Blueprint)
 *
 * Receives Core Web Vitals payloads via POST (from WebVitalsReporter via
 * sendBeacon) and proxies them asynchronously to the Django Ninja backend
 * for SLA-breach logging and Redis counters.
 *
 * Design decisions:
 *   - Always returns 202 Accepted — telemetry must NEVER cause UI errors.
 *   - Uses a 2,000ms abort signal so the edge function never hangs.
 *   - Internal service token header prevents public abuse of the backend endpoint.
 *   - Runs at Node.js (not edge) runtime to allow async DB I/O at the backend.
 */

import { NextRequest, NextResponse } from "next/server";

/** Max time to wait for the backend to accept the payload. */
const BACKEND_TIMEOUT_MS = 2_000;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse the payload sent by sendBeacon (Blob with application/json content)
    const payload = await request.json().catch(() => null);

    if (!payload || typeof payload !== "object") {
      // Accept silently — malformed telemetry must not return 4xx to clients
      return NextResponse.json({ status: "ignored" }, { status: 202 });
    }

    const { id, name, label, value, path, rating, navigationType } = payload as Record<
      string,
      unknown
    >;

    // Gather request metadata for backend enrichment
    const userAgent = request.headers.get("user-agent") ?? "unknown";
    const ipAddress =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      "127.0.0.1";

    const backendPayload = {
      metric_id: id,
      metric_name: name,
      metric_label: label,
      metric_value: value,
      metric_rating: rating,
      navigation_type: navigationType,
      page_path: path,
      user_agent: userAgent,
      ip_address: ipAddress,
    };

    // Asynchronously proxy to Django Ninja telemetry endpoint.
    // We do NOT await this on the critical path; we fire-and-forget
    // with a short timeout to avoid blocking the edge response.
    const backendBase =
      process.env.BACKEND_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "http://127.0.0.1:8001";

    const backendUrl = `${backendBase}/api/common/telemetry/vitals/`;
    const internalToken =
      process.env.INTERNAL_SERVICE_TOKEN ?? "fashionistar-internal-telemetry-2026";

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS);

    fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Token": internalToken,
      },
      body: JSON.stringify(backendPayload),
      signal: controller.signal,
    })
      .catch(() => {
        // Swallow — backend unavailability must never surface to clients
      })
      .finally(() => {
        clearTimeout(timeout);
      });

    return NextResponse.json(
      { status: "accepted" },
      {
        status: 202,
        headers: {
          // No cache — telemetry responses should never be cached
          "Cache-Control": "no-store",
        },
      }
    );
  } catch {
    // Swallow all errors — telemetry must NEVER return 5xx to clients
    return NextResponse.json({ status: "accepted" }, { status: 202 });
  }
}

// Allow GET for health check (monitoring tools probe this endpoint)
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ status: "ok", endpoint: "telemetry/vitals" });
}
