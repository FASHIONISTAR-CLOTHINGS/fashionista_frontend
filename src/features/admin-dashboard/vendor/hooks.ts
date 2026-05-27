/**
 * features/vendor/admin-dashboard/hooks.ts
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminVendors,
  fetchAdminVendorDetail,
  fetchAdminVendorProducts,
  fetchAdminVendorStats,
  approveVendor,
  suspendVendor,
  reactivateVendor,
  rejectVendor,
  updateVendorCommission,
  toggleVendorFeatured,
} from "./api";
import { toast } from "sonner";

export function useAdminVendors(filters?: {
  is_verified?: boolean;
  is_active?: boolean;
  is_featured?: boolean;
  country?: string;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: ["admin", "vendors", filters],
    queryFn: () => fetchAdminVendors(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 15_000,
  });
}

export function useAdminVendorDetail(vendorId: string | null) {
  return useQuery({
    queryKey: ["admin", "vendors", "detail", vendorId],
    queryFn: () => fetchAdminVendorDetail(vendorId!),
    enabled: !!vendorId,
    staleTime: 30_000,
  });
}

export function useAdminVendorProducts(vendorId: string | null, page = 1) {
  return useQuery({
    queryKey: ["admin", "vendors", "products", vendorId, page],
    queryFn: () => fetchAdminVendorProducts(vendorId!, page),
    enabled: !!vendorId,
    staleTime: 30_000,
  });
}

export function useAdminVendorStats() {
  return useQuery({
    queryKey: ["admin", "vendors", "stats"],
    queryFn: fetchAdminVendorStats,
    staleTime: 60_000,
  });
}

// ── Mutation Hooks ──────────────────────────────────────────────────────────

export function useApproveVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vendorId }: { vendorId: string }) => approveVendor(vendorId),
    onSuccess: () => {
      toast.success("Vendor boutique has been approved.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "vendors"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to approve vendor.");
    },
  });
}

export function useSuspendVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vendorId, reason }: { vendorId: string; reason: string }) =>
      suspendVendor(vendorId, reason),
    onSuccess: () => {
      toast.success("Vendor boutique has been suspended.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "vendors"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to suspend vendor.");
    },
  });
}

export function useReactivateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vendorId }: { vendorId: string }) => reactivateVendor(vendorId),
    onSuccess: () => {
      toast.success("Vendor boutique reactivated successfully.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "vendors"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to reactivate vendor.");
    },
  });
}

export function useRejectVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vendorId, reason }: { vendorId: string; reason: string }) =>
      rejectVendor(vendorId, reason),
    onSuccess: () => {
      toast.success("Vendor boutique has been rejected.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "vendors"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to reject vendor.");
    },
  });
}

export function useUpdateVendorCommission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vendorId, commissionRate }: { vendorId: string; commissionRate: number }) =>
      updateVendorCommission(vendorId, commissionRate),
    onSuccess: () => {
      toast.success("Commission rate updated successfully.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "vendors"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update commission rate.");
    },
  });
}

export function useToggleVendorFeatured() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vendorId, featured }: { vendorId: string; featured: boolean }) =>
      toggleVendorFeatured(vendorId, featured),
    onSuccess: () => {
      toast.success("Boutique featured spotlight status updated.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "vendors"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update spotlight status.");
    },
  });
}
