/**
 * features/product/admin-dashboard/hooks.ts
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAdminProducts, deleteAdminProduct } from "./api";
import { useToast } from "@/shared/hooks/use-toast";

export const adminProductKeys = {
  all: ["admin-products"] as const,
  filtered: (params: any) => ["admin-products", params] as const,
};

export function useAdminProducts(params: {
  page?: number;
  page_size?: number;
  q?: string;
  category?: string;
}) {
  return useQuery({
    queryKey: adminProductKeys.filtered(params),
    queryFn: () => fetchAdminProducts(params),
  });
}

export function useDeleteAdminProduct() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteAdminProduct(id),
    onSuccess: () => {
      success("Product deleted successfully from global catalog.");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["catalog", "products"] });
    },
    onError: (err: any) => {
      error(err?.message || "Failed to delete product.");
    },
  });
}
