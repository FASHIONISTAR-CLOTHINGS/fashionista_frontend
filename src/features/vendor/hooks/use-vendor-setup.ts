"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: (payload: VendorSetupPayload) => vendorService.submitSetup(payload),
    onSuccess: async (data) => {
      // ── T4.7: Show explicit success toast BEFORE navigating ─────────────────
      // The 1500ms delay ensures the toast is visible to the user before Next.js
      // replaces the page. The backend message (e.g. "Profile created successfully")
      // is surfaced directly — not a hardcoded string.
      const message =
        (data as { message?: string } | undefined)?.message ??
        "Vendor profile created! Redirecting to your dashboard…";

      toast.success("Setup complete! 🎉", {
        description: message,
        duration: 4000,
      });

      if (user) {
        setUser({ ...user, has_vendor_profile: true });
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: VENDOR_PROFILE_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: VENDOR_SETUP_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: VENDOR_DASHBOARD_QUERY_KEY }),
      ]);

      // 1.5s delay — toast must be readable before navigation replaces the page
      setTimeout(() => {
        router.push("/vendor/dashboard");
      }, 1500);
    },
  });
}
