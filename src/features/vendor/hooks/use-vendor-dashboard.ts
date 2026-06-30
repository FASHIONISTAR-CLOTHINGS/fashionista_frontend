// features/vendor/hooks/use-vendor-dashboard.ts
/**
 * TanStack Query hooks for the vendor Ninja async dashboard endpoints.
 *
 * All dashboard widgets are refactored to read from the unified cached
 * vendorApi.getDashboard() snapshot query using TanStack Query selectors.
 *
 * State hierarchy:
 *   useVendorDashboardSnapshot  → full snapshot (profile + setup_state + payout)
 *   useVendorOrderStats         → aggregate order stats (total + pending + active)
 *   useVendorRecentOrders       → N most recent orders list
 *   useVendorProductSummary     → N most recent products list
 *   useVendorWalletData         → balance + recent transactions
 *   useVendorTopSellingProducts  → top N by qty sold
 *   useVendorCouponStats        → active / inactive coupon counts
 */
import { useQuery } from "@tanstack/react-query";
import { vendorApi } from "@/features/vendor/api/vendor.api";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useIsHydrated } from "@/lib/react/useIsHydrated";

// ── Query Key Factory ─────────────────────────────────────────────────────────
export const vendorDashboardKeys = {
  all:              ["vendor", "dashboard"] as const,
  snapshot:         ["vendor", "dashboard", "snapshot"] as const,
};

// ── Full Vendor Dashboard Snapshot ────────────────────────────────────────────
/**
 * Full vendor dashboard snapshot from Ninja endpoint.
 *
 * @param options - Optional staleTime override
 */
export function useVendorDashboardSnapshot(options?: { staleTime?: number }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasVendorProfile = useAuthStore((state) => state.user?.has_vendor_profile === true);
  const hydrated = useIsHydrated();

  return useQuery({
    queryKey:  vendorDashboardKeys.snapshot,
    queryFn:   () => vendorApi.getDashboard(),
    enabled:   hydrated && isAuthenticated && hasVendorProfile,
    staleTime: options?.staleTime ?? 60_000,
  });
}

// ── Vendor Order Stats ────────────────────────────────────────────────────────
/**
 * Aggregate order stats from the unified dashboard cache.
 */
export function useVendorOrderStats() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasVendorProfile = useAuthStore((state) => state.user?.has_vendor_profile === true);
  const hydrated = useIsHydrated();

  return useQuery({
    queryKey:  vendorDashboardKeys.snapshot,
    queryFn:   () => vendorApi.getDashboard(),
    enabled:   hydrated && isAuthenticated && hasVendorProfile,
    staleTime: 60_000,
    select: (dashboard) => ({
      total_orders:  dashboard.analytics.total_sales,
      total_revenue: dashboard.analytics.total_revenue,
      pending_count: dashboard.recent_orders.filter((o) => o.order_status === "Pending").length,
      active_count:  dashboard.recent_orders.filter((o) => o.order_status === "Processing").length,
    }),
  });
}

// ── Vendor Recent Orders ──────────────────────────────────────────────────────
/**
 * Most recent N orders for the vendor dashboard feed.
 *
 * @param limit - Max rows to fetch (default 10)
 */
export function useVendorRecentOrders(limit: number = 10) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasVendorProfile = useAuthStore((state) => state.user?.has_vendor_profile === true);
  const hydrated = useIsHydrated();

  return useQuery({
    queryKey:  vendorDashboardKeys.snapshot,
    queryFn:   () => vendorApi.getDashboard(),
    enabled:   hydrated && isAuthenticated && hasVendorProfile,
    staleTime: 60_000,
    select: (dashboard) => dashboard.recent_orders.slice(0, limit),
  });
}

// ── Vendor Product Summary ────────────────────────────────────────────────────
/**
 * Top N products by creation date for the vendor dashboard.
 *
 * @param limit - Max rows to fetch (default 10)
 */
export function useVendorProductSummary(limit: number = 10) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasVendorProfile = useAuthStore((state) => state.user?.has_vendor_profile === true);
  const hydrated = useIsHydrated();

  return useQuery({
    queryKey:  vendorDashboardKeys.snapshot,
    queryFn:   () => vendorApi.getDashboard(),
    enabled:   hydrated && isAuthenticated && hasVendorProfile,
    staleTime: 60_000,
    select: (dashboard) => dashboard.products.slice(0, limit),
  });
}

// ── Vendor Wallet Data ────────────────────────────────────────────────────────
/**
 * Vendor wallet balance and 10 most recent transactions.
 */
export function useVendorWalletData() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasVendorProfile = useAuthStore((state) => state.user?.has_vendor_profile === true);
  const hydrated = useIsHydrated();

  return useQuery({
    queryKey:  vendorDashboardKeys.snapshot,
    queryFn:   () => vendorApi.getDashboard(),
    enabled:   hydrated && isAuthenticated && hasVendorProfile,
    staleTime: 60_000,
    select: (dashboard) => dashboard.wallet ?? { balance: 0, recent_transactions: [] },
  });
}

// ── Vendor Top-Selling Products ───────────────────────────────────────────────
/**
 * Top N products by total quantity sold.
 *
 * @param limit - Max rows to fetch (default 5)
 */
export function useVendorTopSellingProducts(limit: number = 5) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasVendorProfile = useAuthStore((state) => state.user?.has_vendor_profile === true);
  const hydrated = useIsHydrated();

  return useQuery({
    queryKey:  vendorDashboardKeys.snapshot,
    queryFn:   () => vendorApi.getDashboard(),
    enabled:   hydrated && isAuthenticated && hasVendorProfile,
    staleTime: 60_000,
    select: (dashboard) => dashboard.top_products.slice(0, limit),
  });
}

// ── Vendor Coupon Stats ───────────────────────────────────────────────────────
/**
 * Active and inactive coupon counts.
 */
export function useVendorCouponStats() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasVendorProfile = useAuthStore((state) => state.user?.has_vendor_profile === true);
  const hydrated = useIsHydrated();

  return useQuery({
    queryKey:  vendorDashboardKeys.snapshot,
    queryFn:   () => vendorApi.getDashboard(),
    enabled:   hydrated && isAuthenticated && hasVendorProfile,
    staleTime: 60_000,
    select: (dashboard) => dashboard.coupons,
  });
}
