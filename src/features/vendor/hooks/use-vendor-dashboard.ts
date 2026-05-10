// features/vendor/hooks/use-vendor-dashboard.ts
/**
 * TanStack Query hooks for the vendor Ninja async dashboard endpoints.
 *
 * These hooks consume the new VendorProfile DB-layer classmethods via
 * the Django-Ninja async API (/api/v1/ninja/vendor/*).
 *
 * State hierarchy:
 *   useVendorDashboardSnapshot → full snapshot (profile + setup_state + payout)
 *   useVendorOrderStats        → aggregate order stats (total + pending + active)
 *   useVendorRecentOrders      → N most recent orders list
 *   useVendorProductSummary    → N most recent products list
 *   useVendorWalletData        → balance + recent transactions
 *   useVendorTopSellingProducts → top N by qty sold
 *   useVendorCouponStats       → active / inactive coupon counts
 */
import { useQuery } from "@tanstack/react-query";
import { vendorApi } from "@/features/vendor/api/vendor.api";

// ── Query Key Factory ─────────────────────────────────────────────────────────
export const vendorDashboardKeys = {
  all:              ["vendor", "dashboard"] as const,
  snapshot:         ["vendor", "dashboard", "snapshot"] as const,
  orderStats:       ["vendor", "dashboard", "order-stats"] as const,
  recentOrders:     (limit: number) =>
                      ["vendor", "dashboard", "recent-orders", limit] as const,
  productSummary:   (limit: number) =>
                      ["vendor", "dashboard", "products", limit] as const,
  walletData:       ["vendor", "dashboard", "wallet"] as const,
  topProducts:      (limit: number) =>
                      ["vendor", "dashboard", "top-products", limit] as const,
  couponStats:      ["vendor", "dashboard", "coupon-stats"] as const,
};

// ── Full Vendor Dashboard Snapshot ────────────────────────────────────────────
/**
 * Full vendor dashboard snapshot from Ninja endpoint.
 *
 * Backed by VendorProfile.aget_full_dashboard_snapshot() at the DB layer.
 * Returns store info, setup state, payout status in a single DB call.
 *
 * @param options - Optional staleTime override
 */
export function useVendorDashboardSnapshot(options?: { staleTime?: number }) {
  return useQuery({
    queryKey:  vendorDashboardKeys.snapshot,
    queryFn:   () => vendorApi.getDashboard(),
    staleTime: options?.staleTime ?? 60_000,
  });
}

// ── Vendor Order Stats ────────────────────────────────────────────────────────
/**
 * Aggregate order stats from the Ninja async endpoint.
 *
 * Backed by VendorProfile.aget_order_stats_from_db().
 * Returns total_orders, total_revenue, pending_count, active_count.
 */
export function useVendorOrderStats() {
  return useQuery({
    queryKey: vendorDashboardKeys.orderStats,
    queryFn:  () => vendorApi.getNinjaOrderStats(),
    staleTime: 30_000,
  });
}

// ── Vendor Recent Orders ──────────────────────────────────────────────────────
/**
 * Most recent N orders for the vendor dashboard feed.
 *
 * Backed by VendorProfile.aget_recent_orders_from_db().
 *
 * @param limit - Max rows to fetch (default 10)
 */
export function useVendorRecentOrders(limit: number = 10) {
  return useQuery({
    queryKey:  vendorDashboardKeys.recentOrders(limit),
    queryFn:   () => vendorApi.getNinjaRecentOrders(limit),
    staleTime: 30_000,
  });
}

// ── Vendor Product Summary ────────────────────────────────────────────────────
/**
 * Top N products by creation date for the vendor dashboard.
 *
 * Backed by VendorProfile.aget_product_summary_from_db().
 *
 * @param limit - Max rows to fetch (default 10)
 */
export function useVendorProductSummary(limit: number = 10) {
  return useQuery({
    queryKey:  vendorDashboardKeys.productSummary(limit),
    queryFn:   () => vendorApi.getNinjaProductSummary(limit),
    staleTime: 60_000,
  });
}

// ── Vendor Wallet Data ────────────────────────────────────────────────────────
/**
 * Vendor wallet balance and 10 most recent transactions.
 *
 * Backed by VendorProfile.aget_wallet_balance_from_db() + vendor_wallet_transactions.
 */
export function useVendorWalletData() {
  return useQuery({
    queryKey:  vendorDashboardKeys.walletData,
    queryFn:   () => vendorApi.getNinjaWalletData(),
    staleTime: 30_000,
  });
}

// ── Vendor Top-Selling Products ───────────────────────────────────────────────
/**
 * Top N products by total quantity sold.
 *
 * Backed by VendorProfile.aget_top_selling_products_from_db().
 *
 * @param limit - Max rows to fetch (default 5)
 */
export function useVendorTopSellingProducts(limit: number = 5) {
  return useQuery({
    queryKey:  vendorDashboardKeys.topProducts(limit),
    queryFn:   () => vendorApi.getNinjaTopSellingProducts(limit),
    staleTime: 120_000,
  });
}

// ── Vendor Coupon Stats ───────────────────────────────────────────────────────
/**
 * Active and inactive coupon counts.
 *
 * Backed by VendorProfile.aget_coupon_stats_from_db().
 */
export function useVendorCouponStats() {
  return useQuery({
    queryKey:  vendorDashboardKeys.couponStats,
    queryFn:   () => vendorApi.getNinjaCouponStats(),
    staleTime: 60_000,
  });
}
