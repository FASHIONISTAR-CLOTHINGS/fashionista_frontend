// features/vendor/hooks/use-vendor-products.ts
/**
 * TanStack Query hooks for vendor product management.
 * Aligned with: /api/v1/vendor/products/*
 */
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { vendorApi } from "@/features/vendor/api/vendor.api";
import type {
  VendorProductCreatePayload,
  VendorProductUpdatePayload,
} from "@/features/vendor/types/vendor.types";

export const vendorProductKeys = {
  all:       ["vendor", "products"] as const,
  list:      (filters?: Record<string, string>) => [...vendorProductKeys.all, "list", filters] as const,
  lowStock:  ["vendor", "products", "low-stock"] as const,
  topSelling:["vendor", "products", "top"] as const,
};

export function useVendorProducts(filters?: { status?: string; ordering?: string }) {
  return useQuery({
    queryKey:  vendorProductKeys.list(filters),
    queryFn:   () => filters ? vendorApi.filterProducts(filters) : vendorApi.getProducts(),
    staleTime: 30_000,
  });
}

export function useVendorLowStockProducts() {
  return useQuery({
    queryKey:  vendorProductKeys.lowStock,
    queryFn:   vendorApi.getLowStockProducts,
    staleTime: 60_000,
  });
}

export function useVendorTopSellingProducts() {
  return useQuery({
    queryKey:  vendorProductKeys.topSelling,
    queryFn:   vendorApi.getTopSellingProducts,
    staleTime: 60_000,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: VendorProductCreatePayload) => vendorApi.createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorProductKeys.all });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pid, payload }: { pid: string; payload: VendorProductUpdatePayload }) =>
      vendorApi.updateProduct(pid, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorProductKeys.all });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pid: string) => vendorApi.deleteProduct(pid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorProductKeys.all });
    },
  });
}
