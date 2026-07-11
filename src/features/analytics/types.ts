/**
 * features/analytics/types.ts
 *
 * TypeScript types for the analytics domain, mirroring the Django Ninja
 * Pydantic schemas defined in apps/analytics/apis/async_/analytics_views.py.
 */

// ── Dashboard Response ────────────────────────────────────────────────────────

export interface AnalyticsDashboard {
  performance_count: number;
  business_count: number;
  alert_count: number;
  activity_count: number;
  avg_response_time_ms: number;
}

// ── Analytics Report ──────────────────────────────────────────────────────────

export interface AnalyticsReport {
  generated_at: string;
  days: number;
  scope: string;
  order_metrics: Record<string, number | string>;
  product_metrics: Record<string, number | string>;
  user_metrics: Record<string, number | string>;
  vendor_metrics: Record<string, number | string>;
  anomalies: Array<Record<string, unknown>>;
  llm_insights: string;
}

// ── Realtime Snapshot ─────────────────────────────────────────────────────────

export interface RealtimeSnapshot {
  generated_at: string;
  status: "ready" | "computing";
  message?: string;
  websocket_url?: string;
  [key: string]: unknown;
}

// ── System Overview (dashboard sub-router) ────────────────────────────────────

export interface SystemOverview {
  generated_at: string;
  ingestion: {
    metrics_24h: number;
    metrics_1h: number;
    rate_per_minute: number;
  };
  performance: {
    records_24h: number;
    errors_24h: number;
    error_rate: number;
  };
  alerts: {
    firing: number;
  };
  activity: {
    events_24h: number;
  };
  business: {
    total_records: number;
  };
  storage: Record<string, number>;
}

// ── Ingestion Rate ────────────────────────────────────────────────────────────

export interface IngestionRatePoint {
  hour: string;
  count: number;
}

export interface IngestionRate {
  generated_at: string;
  hours: number;
  data_points: IngestionRatePoint[];
  total: number;
}

// ── Metric ────────────────────────────────────────────────────────────────────

export interface Metric {
  id: number;
  name: string;
  metric_type: string;
  value: number;
  tags: Record<string, unknown>;
  timestamp: string;
}

// ── Performance Metric ────────────────────────────────────────────────────────

export interface PerformanceMetric {
  id: number;
  endpoint: string;
  method: string;
  response_time_ms: number;
  status_code: number;
  timestamp: string;
}

// ── User Activity ─────────────────────────────────────────────────────────────

export interface UserActivity {
  id: number;
  action: string;
  resource: string;
  resource_id: number | null;
  timestamp: string;
  user_id: string | null;
}

// ── Business Metric ───────────────────────────────────────────────────────────

export interface BusinessMetric {
  id: number;
  metric_name: string;
  value: number;
  period_start: string;
  period_end: string;
  created_at: string;
}

// ── Alert ─────────────────────────────────────────────────────────────────────

export interface AnalyticsAlert {
  id: number;
  rule_id: number;
  rule_name: string;
  status: string;
  severity: string;
  metric_value: number;
  message: string;
  fired_at: string;
  resolved_at: string | null;
}

// ── Metric Rollup ─────────────────────────────────────────────────────────────

export interface MetricRollup {
  id: number;
  name: string;
  metric_type: string;
  window: string;
  timestamp: string;
  avg: number;
  min: number;
  max: number;
  count: number;
  sum: number;
}

export interface MetricRollupResponse {
  window: string;
  metric_name: string | null;
  count: number;
  results: MetricRollup[];
}

// ── Paginated Envelope ────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
  page?: number;
  page_size?: number;
}

// ── WebSocket Events ──────────────────────────────────────────────────────────

export interface AnalyticsWSEvent {
  type: "analytics_snapshot" | "pong" | string;
  data?: Record<string, unknown>;
  timestamp?: string;
}

// ── Query Parameters ──────────────────────────────────────────────────────────

export interface MetricsQueryParams {
  metric_name?: string;
  metric_type?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}

export interface PerformanceQueryParams {
  endpoint?: string;
  date_from?: string;
  date_to?: string;
  hours?: number;
  page?: number;
  page_size?: number;
}

export interface UserActivityQueryParams {
  user_id?: string;
  action?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}

export interface BusinessMetricsQueryParams {
  metric_name?: string;
  period_start?: string;
  period_end?: string;
  days?: number;
  page?: number;
  page_size?: number;
}

export interface AlertsQueryParams {
  status?: string;
  severity?: string;
  page?: number;
  page_size?: number;
}

export interface RollupQueryParams {
  metric_name?: string;
  window?: "1m" | "5m" | "1h" | "1d";
  date_from?: string;
  date_to?: string;
  limit?: number;
}
