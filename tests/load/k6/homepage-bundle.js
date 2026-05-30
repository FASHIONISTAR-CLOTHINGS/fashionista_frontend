/**
 * tests/load/k6/homepage-bundle.js — Phase G3
 *
 * K6 Load Test: Homepage Bundle Endpoint
 *
 * Tests the Django-Ninja /api/v1/ninja/catalog/homepage/bundle/ endpoint
 * under realistic concurrent user load (10k RPS target).
 *
 * Performance Targets:
 *   p95 < 100ms  (with Redis cache warm)
 *   p99 < 250ms  (cache miss + asyncio.gather())
 *   error rate < 0.1%
 *   RPS: 10k+ (verified via Redis cache + connection pooling)
 *
 * Run with:
 *   k6 run tests/load/k6/homepage-bundle.js
 *   k6 run --env BASE_URL=https://api.fashionistar.com tests/load/k6/homepage-bundle.js
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";

// ── Custom metrics ────────────────────────────────────────────────────────────

const errorRate     = new Rate("errors");
const bundleTrend   = new Trend("homepage_bundle_duration_ms");
const cacheHitRate  = new Rate("cache_hit");
const cacheHits     = new Counter("cache_hits");
const cacheMisses   = new Counter("cache_misses");

// ── Load stage definition ─────────────────────────────────────────────────────

export const options = {
  stages: [
    // Warm-up — prime Redis cache with first requests
    { duration: "30s",  target: 50   },  // ramp up to 50 VUs
    // Steady state — realistic daily traffic
    { duration: "1m",   target: 200  },  // 200 VUs (~2k RPS baseline)
    // Peak load — launch week traffic spike
    { duration: "2m",   target: 1000 },  // 1k VUs (~10k RPS target)
    // Sustained peak — 5 min hold
    { duration: "5m",   target: 1000 },
    // Cool-down
    { duration: "30s",  target: 0    },
  ],

  thresholds: {
    // Response time targets
    http_req_duration: ["p(95)<100", "p(99)<250"],
    // Error rate — never exceed 0.1%
    errors: ["rate<0.001"],
    // Cache hit — should be >85% after warm-up
    cache_hit: ["rate>0.85"],
    // Specific endpoint duration
    homepage_bundle_duration_ms: ["p(95)<100", "p(99)<250"],
  },
};

// ── Test fixtures ─────────────────────────────────────────────────────────────

const BASE_URL = __ENV.BASE_URL || "http://localhost:8000";

const HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
  // Bypass ngrok browser warnings in dev
  "ngrok-skip-browser-warning": "true",
};

// ── Main test function ────────────────────────────────────────────────────────

export default function () {
  // ── 1. Homepage Bundle (primary test) ─────────────────────────────────────
  const bundleRes = http.get(
    `${BASE_URL}/api/v1/ninja/catalog/homepage/bundle/`,
    { headers: HEADERS }
  );

  const bundleOk = check(bundleRes, {
    "bundle: status 200":                (r) => r.status === 200,
    "bundle: has collections":           (r) => {
      try { return Array.isArray(JSON.parse(r.body as string)?.data?.collections); }
      catch { return false; }
    },
    "bundle: has categories":            (r) => {
      try { return Array.isArray(JSON.parse(r.body as string)?.data?.categories); }
      catch { return false; }
    },
    "bundle: has featured_products":     (r) => {
      try { return Array.isArray(JSON.parse(r.body as string)?.data?.featured_products); }
      catch { return false; }
    },
    "bundle: duration < 100ms":          (r) => r.timings.duration < 100,
  });

  errorRate.add(!bundleOk);
  bundleTrend.add(bundleRes.timings.duration);

  // Detect Redis cache hit via response time heuristic
  // (cache hit: <5ms; cache miss: typically 20-80ms)
  const isCacheHit = bundleRes.timings.duration < 10;
  cacheHitRate.add(isCacheHit);
  if (isCacheHit) {
    cacheHits.add(1);
  } else {
    cacheMisses.add(1);
  }

  sleep(0.1); // 100ms think time between requests

  // ── 2. Categories list (secondary) ────────────────────────────────────────
  const categoriesRes = http.get(
    `${BASE_URL}/api/v1/ninja/catalog/categories/`,
    { headers: HEADERS }
  );

  check(categoriesRes, {
    "categories: status 200":       (r) => r.status === 200,
    "categories: duration < 100ms": (r) => r.timings.duration < 100,
  });

  sleep(0.05);

  // ── 3. Homepage banners (tertiary — short TTL) ─────────────────────────────
  const bannersRes = http.get(
    `${BASE_URL}/api/v1/ninja/catalog/homepage/banners/?slot=hero`,
    { headers: HEADERS }
  );

  check(bannersRes, {
    "banners: status 200":       (r) => r.status === 200 || r.status === 404,
    "banners: duration < 100ms": (r) => r.timings.duration < 100,
  });

  sleep(0.1);
}

// ── Summary handler ───────────────────────────────────────────────────────────

export function handleSummary(data: Record<string, unknown>) {
  return {
    "tests/load/k6/results/homepage-bundle-summary.json": JSON.stringify(data, null, 2),
    stdout: formatSummary(data),
  };
}

function formatSummary(data: Record<string, unknown>): string {
  const metrics = data.metrics as Record<string, { values: Record<string, number> }>;
  const dur = metrics?.http_req_duration?.values ?? {};
  const err = metrics?.errors?.values ?? {};
  const cache = metrics?.cache_hit?.values ?? {};

  return `
╔════════════════════════════════════════════════════════╗
║      FASHIONISTAR — K6 Homepage Bundle Load Test       ║
╠════════════════════════════════════════════════════════╣
║  p50  latency : ${(dur.med ?? 0).toFixed(1).padStart(7)}ms                         ║
║  p95  latency : ${(dur["p(95)"] ?? 0).toFixed(1).padStart(7)}ms  (target: <100ms)   ║
║  p99  latency : ${(dur["p(99)"] ?? 0).toFixed(1).padStart(7)}ms  (target: <250ms)   ║
║  error rate   : ${((err.rate ?? 0) * 100).toFixed(3).padStart(7)}%  (target: <0.1%)    ║
║  cache hit    : ${((cache.rate ?? 0) * 100).toFixed(1).padStart(7)}%  (target: >85%)    ║
╚════════════════════════════════════════════════════════╝
`;
}
