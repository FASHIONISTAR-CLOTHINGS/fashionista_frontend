import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { vendorService } from "@/features/vendor/services/vendor.service";
import type { VendorSetupPayload } from "@/features/vendor/types/vendor.types";

const VENDOR_PROFILE_QUERY_KEY = ["vendor", "profile"] as const;
const VENDOR_SETUP_QUERY_KEY = ["vendor", "setup"] as const;
const VENDOR_DASHBOARD_QUERY_KEY = ["vendor", "dashboard"] as const;

export function useVendorProfile(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: VENDOR_PROFILE_QUERY_KEY,
    queryFn: vendorService.getProfile,
    enabled: options?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useVendorSetupState() {
  return useQuery({
    queryKey: VENDOR_SETUP_QUERY_KEY,
    queryFn: vendorService.getSetupState,
    staleTime: 15_000,
  });
}

export function useVendorDashboard() {
  return useQuery({
    queryKey: VENDOR_DASHBOARD_QUERY_KEY,
    queryFn: vendorService.getDashboard,
    staleTime: 30_000,
  });
}

export function useSubmitVendorSetup() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: (payload: VendorSetupPayload) => vendorService.submitSetup(payload),
    onSuccess: async () => {
      if (user) {
        setUser({ ...user, has_vendor_profile: true });
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: VENDOR_PROFILE_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: VENDOR_SETUP_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: VENDOR_DASHBOARD_QUERY_KEY }),
      ]);
    },
  });
}
