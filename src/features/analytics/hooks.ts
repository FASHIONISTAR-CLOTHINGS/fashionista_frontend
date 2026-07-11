/**
 * features/analytics/hooks.ts
 *
 * TanStack Query hooks for the analytics domain.
 * Follows the established query-key factory pattern from admin-dashboard features.
 */

import { useQuery } from "@tanstack/react-query";
import {
  fetchAnalyticsDashboard,
  fetchPlatformReport,
  fetchVendorReport,
  fetchOrderReport,
  fetchProductReport,
  fetchUserReport,
  fetchRealtimeSnapshot,
  fetchSystemOverview,
  fetchIngestionRate,
  fetchMetrics,
  fetchPerformanceMetrics,
  fetchUserActivity,
  fetchBusinessMetrics,
  fetchAlerts,
  fetchRollups,
  fetchAnalyticsHealth,
} from "./api";
import type {
  MetricsQueryParams,
  PerformanceQueryParams,
  UserActivityQueryParams,
  BusinessMetricsQueryParams,
  AlertsQueryParams,
  RollupQueryParams,
} from "./types";

// ── Query Key Factory ─────────────────────────────────────────────────────────

export const analyticsKeys = {
  all: ["analytics"] as const,
  dashboard: ["analytics", "dashboard"] as const,
  systemOverview: ["analytics", "system-overview"] as const,
  ingestionRate: (hours: number) => ["analytics", "ingestion-rate", { hours }] as const,
  realtime: ["analytics", "realtime"] as const,
  health: ["analytics", "health"] as const,
  reports: {
    platform: (days: number) => ["analytics", "report", "platform", { days }] as const,
    vendor: (vendorId: number, days: number) =>
      ["analytics", "report", "vendor", { vendorId, days }] as const,
    orders: (days: number) => ["analytics", "report", "orders", { days }] as const,
    products: (days: number) => ["analytics", "report", "products", { days }] as const,
    users: (days: number) => ["analytics", "report", "users", { days }] as const,
  },
  metrics: (params: MetricsQueryParams) =>
    ["analytics", "metrics", params] as const,
  performance: (params: PerformanceQueryParams) =>
    ["analytics", "performance", params] as const,
  userActivity: (params: UserActivityQueryParams) =>
    ["analytics", "user-activity", params] as const,
  businessMetrics: (params: BusinessMetricsQueryParams) =>
    ["analytics", "business-metrics", params] as const,
  alerts: (params: AlertsQueryParams) =>
    ["analytics", "alerts", params] as const,
  rollups: (params: RollupQueryParams) =>
    ["analytics", "rollups", params] as const,
};

// ── Dashboard Hooks ───────────────────────────────────────────────────────────

export function useAnalyticsDashboard() {
  return useQuery({
    queryKey: analyticsKeys.dashboard,
    queryFn: fetchAnalyticsDashboard,
    staleTime: 60 * 1000,
  });
}

export function useSystemOverview() {
  return useQuery({
    queryKey: analyticsKeys.systemOverview,
    queryFn: fetchSystemOverview,
    staleTime: 60 * 1000,
  });
}

export function useIngestionRate(hours = 24) {
  return useQuery({
    queryKey: analyticsKeys.ingestionRate(hours),
    queryFn: () => fetchIngestionRate(hours),
    staleTime: 60 * 1000,
  });
}

// ── Report Hooks ──────────────────────────────────────────────────────────────

export function usePlatformReport(days = 7) {
  return useQuery({
    queryKey: analyticsKeys.reports.platform(days),
    queryFn: () => fetchPlatformReport(days),
    staleTime: 5 * 60 * 1000,
  });
}

export function useVendorReport(vendorId: number, days = 7) {
  return useQuery({
    queryKey: analyticsKeys.reports.vendor(vendorId, days),
    queryFn: () => fetchVendorReport(vendorId, days),
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useOrderReport(days = 30) {
  return useQuery({
    queryKey: analyticsKeys.reports.orders(days),
    queryFn: () => fetchOrderReport(days),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProductReport(days = 30) {
  return useQuery({
    queryKey: analyticsKeys.reports.products(days),
    queryFn: () => fetchProductReport(days),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserReport(days = 30) {
  return useQuery({
    queryKey: analyticsKeys.reports.users(days),
    queryFn: () => fetchUserReport(days),
    staleTime: 5 * 60 * 1000,
  });
}

// ── Realtime Snapshot Hook ────────────────────────────────────────────────────

export function useRealtimeSnapshot() {
  return useQuery({
    queryKey: analyticsKeys.realtime,
    queryFn: fetchRealtimeSnapshot,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
}

// ── Metrics Hooks ─────────────────────────────────────────────────────────────

export function useMetrics(params: MetricsQueryParams = {}) {
  return useQuery({
    queryKey: analyticsKeys.metrics(params),
    queryFn: () => fetchMetrics(params),
    staleTime: 60 * 1000,
  });
}

export function usePerformanceMetrics(params: PerformanceQueryParams = {}) {
  return useQuery({
    queryKey: analyticsKeys.performance(params),
    queryFn: () => fetchPerformanceMetrics(params),
    staleTime: 60 * 1000,
  });
}

export function useUserActivity(params: UserActivityQueryParams = {}) {
  return useQuery({
    queryKey: analyticsKeys.userActivity(params),
    queryFn: () => fetchUserActivity(params),
    staleTime: 60 * 1000,
  });
}

export function useBusinessMetrics(params: BusinessMetricsQueryParams = {}) {
  return useQuery({
    queryKey: analyticsKeys.businessMetrics(params),
    queryFn: () => fetchBusinessMetrics(params),
    staleTime: 60 * 1000,
  });
}

// ── Alerts Hooks ──────────────────────────────────────────────────────────────

export function useAlerts(params: AlertsQueryParams = {}) {
  return useQuery({
    queryKey: analyticsKeys.alerts(params),
    queryFn: () => fetchAlerts(params),
    staleTime: 30 * 1000,
  });
}

// ── Rollups Hooks ─────────────────────────────────────────────────────────────

export function useRollups(params: RollupQueryParams = {}) {
  return useQuery({
    queryKey: analyticsKeys.rollups(params),
    queryFn: () => fetchRollups(params),
    staleTime: 60 * 1000,
  });
}

// ── Health Hook ───────────────────────────────────────────────────────────────

export function useAnalyticsHealth() {
  return useQuery({
    queryKey: analyticsKeys.health,
    queryFn: fetchAnalyticsHealth,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}
