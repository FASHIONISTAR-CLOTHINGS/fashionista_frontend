"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { getPostAuthRedirectPath } from "@/features/auth/lib/auth-routing";

export default function VendorIndexPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/sign-in?returnUrl=%2Fvendor");
      return;
    }

    router.replace(
      getPostAuthRedirectPath({
        role: user?.role,
        isStaff: user?.is_staff,
        hasVendorProfile: user?.has_vendor_profile,
        returnUrl: "/vendor/dashboard",
      }),
    );
  }, [
    isAuthenticated,
    router,
    user?.has_vendor_profile,
    user?.is_staff,
    user?.role,
  ]);

  return (
    <div className="min-h-[40vh] animate-pulse rounded-[32px] bg-white/60" />
  );
}
