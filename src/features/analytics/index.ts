/**
 * features/analytics/index.ts
 *
 * Public FSD barrel for the analytics feature slice.
 */

// Types
export * from "./types";

// API
export * from "./api";

// TanStack Query hooks
export * from "./hooks";

// WebSocket hook
export { useRealtimeAnalytics } from "./hooks/use-realtime-analytics";

// Zustand store
export { useRealtimeStore } from "./stores/realtime-store";

// Components
export { AnalyticsDashboard } from "./components/AnalyticsDashboard";
export { AnalyticsKpiCards } from "./components/AnalyticsKpiCards";
export { IngestionRateChart } from "./components/IngestionRateChart";
export { RealtimeFeed } from "./components/RealtimeFeed";
export { AlertPanel } from "./components/AlertPanel";
export { AnalyticsReportView } from "./components/AnalyticsReportView";
export { ReportTable } from "./components/ReportTable";
export { DateRangePicker } from "./components/DateRangePicker";
export { ExportButton } from "./components/ExportButton";
