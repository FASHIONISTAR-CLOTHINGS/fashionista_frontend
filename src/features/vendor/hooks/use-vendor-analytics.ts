// features/vendor/hooks/use-vendor-analytics.ts
/**
 * TanStack Query hooks for vendor analytics.
 * Aligned with: /api/v1/vendor/analytics/* and /api/v1/vendor/earnings/
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vendorApi } from "@/features/vendor/api/vendor.api";
import { toast } from "sonner";

export const vendorAnalyticsKeys = {
  summary:      ["vendor", "analytics", "summary"] as const,
  revenue:      ["vendor", "analytics", "revenue"] as const,
  orders:       ["vendor", "analytics", "orders"] as const,
  products:     ["vendor", "analytics", "products"] as const,
  categories:   ["vendor", "analytics", "categories"] as const,
  distribution: ["vendor", "analytics", "distribution"] as const,
  customers:    ["vendor", "analytics", "customers"] as const,
  earnings:     ["vendor", "earnings"] as const,
  reviews:      ["vendor", "reviews"] as const,
  coupons:      ["vendor", "coupons"] as const,
};

export function useVendorAnalyticsSummary() {
  return useQuery({
    queryKey:  vendorAnalyticsKeys.summary,
    queryFn:   vendorApi.getAnalyticsSummary,
    staleTime: 60_000,
  });
}

export function useVendorRevenueChart() {
  return useQuery({
    queryKey:  vendorAnalyticsKeys.revenue,
    queryFn:   vendorApi.getRevenueChart,
    staleTime: 120_000,
  });
}

export function useVendorOrderChart() {
  return useQuery({
    queryKey:  vendorAnalyticsKeys.orders,
    queryFn:   vendorApi.getOrderChart,
    staleTime: 120_000,
  });
}

export function useVendorProductChart() {
  return useQuery({
    queryKey:  vendorAnalyticsKeys.products,
    queryFn:   vendorApi.getProductChart,
    staleTime: 120_000,
  });
}

export function useVendorTopCategories() {
  return useQuery({
    queryKey:  vendorAnalyticsKeys.categories,
    queryFn:   vendorApi.getTopCategories,
    staleTime: 120_000,
  });
}

export function useVendorPaymentDistribution() {
  return useQuery({
    queryKey:  vendorAnalyticsKeys.distribution,
    queryFn:   vendorApi.getPaymentDistribution,
    staleTime: 120_000,
  });
}

export function useVendorCustomerBehavior() {
  return useQuery({
    queryKey:  vendorAnalyticsKeys.customers,
    queryFn:   vendorApi.getCustomerBehavior,
    staleTime: 120_000,
  });
}

export function useVendorEarnings() {
  return useQuery({
    queryKey:  vendorAnalyticsKeys.earnings,
    queryFn:   vendorApi.getEarnings,
    staleTime: 60_000,
  });
}

export function useVendorReviews() {
  return useQuery({
    queryKey:  vendorAnalyticsKeys.reviews,
    queryFn:   vendorApi.getReviews,
    staleTime: 60_000,
  });
}

export function useVendorCoupons() {
  return useQuery({
    queryKey:  vendorAnalyticsKeys.coupons,
    queryFn:   vendorApi.getCoupons,
    staleTime: 60_000,
  });
}

export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      code: string;
      discount_type: "percentage" | "fixed";
      discount_value: number;
      minimum_order: number;
      valid_from: string;
      valid_to: string;
      active: boolean;
    }) => vendorApi.createCoupon(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: vendorAnalyticsKeys.coupons });
      toast.success("Coupon created successfully!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to create coupon.");
    },
  });
}

export function useDeactivateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (couponId: string) => vendorApi.deleteCoupon(couponId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: vendorAnalyticsKeys.coupons });
      toast.success("Coupon deactivated successfully.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to deactivate coupon.");
    },
  });
}
