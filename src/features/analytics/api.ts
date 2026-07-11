/**
 * features/analytics/api.ts
 *
 * Typed API functions for the analytics domain using the existing `apiAsync`
 * Ky client (points to /api/v1/ninja). All methods return typed responses
 * and leverage the Fashionistar envelope unwrapping helpers.
 */

import { apiAsync } from "@/core/api/client.async";
import { buildSearchParams } from "@/core/api/response";
import type {
  AnalyticsDashboard,
  AnalyticsReport,
  RealtimeSnapshot,
  SystemOverview,
  IngestionRate,
  Metric,
  PerformanceMetric,
  UserActivity,
  BusinessMetric,
  AnalyticsAlert,
  MetricRollupResponse,
  PaginatedResponse,
  MetricsQueryParams,
  PerformanceQueryParams,
  UserActivityQueryParams,
  BusinessMetricsQueryParams,
  AlertsQueryParams,
  RollupQueryParams,
} from "./types";

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function fetchAnalyticsDashboard(): Promise<AnalyticsDashboard> {
  return apiAsync.get("analytics/dashboard/").json<AnalyticsDashboard>();
}

// ── Reports ───────────────────────────────────────────────────────────────────

export async function fetchPlatformReport(days = 7): Promise<AnalyticsReport> {
  const qs = buildSearchParams({ days });
  return apiAsync.get(`analytics/platform/overview/?${qs}`).json<AnalyticsReport>();
}

export async function fetchVendorReport(vendorId: number, days = 7): Promise<AnalyticsReport> {
  const qs = buildSearchParams({ days });
  return apiAsync
    .get(`analytics/vendors/${vendorId}/overview/?${qs}`)
    .json<AnalyticsReport>();
}

export async function fetchOrderReport(days = 30): Promise<AnalyticsReport> {
  const qs = buildSearchParams({ days });
  return apiAsync.get(`analytics/orders/?${qs}`).json<AnalyticsReport>();
}

export async function fetchProductReport(days = 30): Promise<AnalyticsReport> {
  const qs = buildSearchParams({ days });
  return apiAsync.get(`analytics/products/?${qs}`).json<AnalyticsReport>();
}

export async function fetchUserReport(days = 30): Promise<AnalyticsReport> {
  const qs = buildSearchParams({ days });
  return apiAsync.get(`analytics/users/?${qs}`).json<AnalyticsReport>();
}

// ── Realtime ──────────────────────────────────────────────────────────────────

export async function fetchRealtimeSnapshot(): Promise<RealtimeSnapshot> {
  return apiAsync.get("analytics/realtime/").json<RealtimeSnapshot>();
}

// ── System Overview (dashboard sub-router) ────────────────────────────────────

export async function fetchSystemOverview(): Promise<SystemOverview> {
  return apiAsync.get("analytics/dashboard/overview/").json<SystemOverview>();
}

export async function fetchIngestionRate(hours = 24): Promise<IngestionRate> {
  const qs = buildSearchParams({ hours });
  return apiAsync.get(`analytics/dashboard/ingestion-rate/?${qs}`).json<IngestionRate>();
}

// ── Metrics ───────────────────────────────────────────────────────────────────

export async function fetchMetrics(
  params: MetricsQueryParams = {},
): Promise<PaginatedResponse<Metric>> {
  const qs = buildSearchParams({
    metric_name: params.metric_name,
    metric_type: params.metric_type,
    date_from: params.date_from,
    date_to: params.date_to,
    page: params.page,
    page_size: params.page_size,
  });
  return apiAsync.get(`analytics/metrics/?${qs}`).json<PaginatedResponse<Metric>>();
}

// ── Performance ───────────────────────────────────────────────────────────────

export async function fetchPerformanceMetrics(
  params: PerformanceQueryParams = {},
): Promise<PaginatedResponse<PerformanceMetric>> {
  const qs = buildSearchParams({
    endpoint: params.endpoint,
    date_from: params.date_from,
    date_to: params.date_to,
    hours: params.hours,
    page: params.page,
    page_size: params.page_size,
  });
  return apiAsync
    .get(`analytics/performance/?${qs}`)
    .json<PaginatedResponse<PerformanceMetric>>();
}

// ── User Activity ─────────────────────────────────────────────────────────────

export async function fetchUserActivity(
  params: UserActivityQueryParams = {},
): Promise<PaginatedResponse<UserActivity>> {
  const qs = buildSearchParams({
    user_id: params.user_id,
    action: params.action,
    date_from: params.date_from,
    date_to: params.date_to,
    page: params.page,
    page_size: params.page_size,
  });
  return apiAsync
    .get(`analytics/user-activity/?${qs}`)
    .json<PaginatedResponse<UserActivity>>();
}

// ── Business Metrics ──────────────────────────────────────────────────────────

export async function fetchBusinessMetrics(
  params: BusinessMetricsQueryParams = {},
): Promise<PaginatedResponse<BusinessMetric>> {
  const qs = buildSearchParams({
    metric_name: params.metric_name,
    period_start: params.period_start,
    period_end: params.period_end,
    days: params.days,
    page: params.page,
    page_size: params.page_size,
  });
  return apiAsync
    .get(`analytics/business-metrics/?${qs}`)
    .json<PaginatedResponse<BusinessMetric>>();
}

// ── Alerts ────────────────────────────────────────────────────────────────────

export async function fetchAlerts(
  params: AlertsQueryParams = {},
): Promise<PaginatedResponse<AnalyticsAlert>> {
  const qs = buildSearchParams({
    status: params.status,
    severity: params.severity,
    page: params.page,
    page_size: params.page_size,
  });
  return apiAsync.get(`analytics/alerts/?${qs}`).json<PaginatedResponse<AnalyticsAlert>>();
}

export async function resolveAlert(
  alertId: number,
  resolutionNotes?: string,
): Promise<{ id: number; status: string; resolved_at: string; message: string }> {
  return apiAsync
    .post(`analytics/alerts/${alertId}/resolve/`, {
      json: { resolution_notes: resolutionNotes ?? null },
    })
    .json();
}

// ── Rollups ───────────────────────────────────────────────────────────────────

export async function fetchRollups(
  params: RollupQueryParams = {},
): Promise<MetricRollupResponse> {
  const qs = buildSearchParams({
    metric_name: params.metric_name,
    window: params.window,
    date_from: params.date_from,
    date_to: params.date_to,
    limit: params.limit,
  });
  return apiAsync.get(`analytics/rollups/?${qs}`).json<MetricRollupResponse>();
}

// ── Health ────────────────────────────────────────────────────────────────────

export async function fetchAnalyticsHealth(): Promise<{
  service: string;
  status: string;
  response_time_ms: number;
  checks: unknown[];
}> {
  return apiAsync.get("analytics/health/").json();
}
