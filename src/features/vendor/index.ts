/**
 * @file index.ts
 * @description Public API for the `features/vendor` canonical FSD slice.
 *
 * Aligned with:
 *   - DRF sync  → /api/v1/vendor/*
 *   - Ninja async → /api/v1/ninja/vendor/*  (backed by VendorProfile DB classmethods)
 */

// ── Types ───────────────────────────────────────────────────────────────────
export type {
  VendorOnboardingStatus,
  ProductStatus,
  OrderStatus,
  VendorOrderStatus,
  PaymentStatus,
  VendorSetupState,
  VendorProfile,
  VendorDashboard,
  VendorProductListItem,
  VendorProductCreatePayload,
  VendorProductUpdatePayload,
  VendorOrderItem,
  VendorOrder,
  VendorEarningItem,
  VendorEarningTracker,
  VendorAnalyticsSummary,
  VendorChartDataPoint,
  VendorTopCategory,
  VendorPaymentDistribution,
  VendorReviewItem,
  VendorCoupon,
  VendorSetupPayload,
  VendorPayoutPayload,
  VendorPinSetPayload,
  VendorPinVerifyPayload,
} from "./types/vendor.types";

// ── Schemas ──────────────────────────────────────────────────────────────────
export * from "./schemas/vendor.schemas";

// ── API ──────────────────────────────────────────────────────────────────────
export { vendorApi } from "./api/vendor.api";

// ── TanStack Query Hooks (DRF / legacy analytics) ────────────────────────────
export * from "./hooks/use-vendor-setup";
export * from "./hooks/use-vendor-products";
export * from "./hooks/use-vendor-orders";
export * from "./hooks/use-vendor-analytics";

// ── TanStack Query Hooks (Ninja async — DB-layer classmethods) ───────────────
export {
  vendorDashboardKeys,
  useVendorDashboardSnapshot,
  useVendorOrderStats,
  useVendorRecentOrders,
  useVendorProductSummary,
  useVendorWalletData,
  useVendorTopSellingProducts,
  useVendorCouponStats,
} from "./hooks/use-vendor-dashboard";

// ── Zustand Store ────────────────────────────────────────────────────────────
export * from "./store/vendor.store";

// ── Components ───────────────────────────────────────────────────────────────
export * from "./components/vendor-shell";
export * from "./components/vendor-views";
