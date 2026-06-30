import { toast } from "sonner";

import { getCanonicalDashboardPath, normalizeCanonicalRole } from "@/features/auth/lib/auth-routing";
import { useAuthStore } from "@/features/auth/store/auth.store";

const COMMERCE_BLOCK_TOAST_ID = "fashionistar-commerce-role-block";

export function ensureCommerceAccess(options?: {
  actionLabel?: string;
  redirect?: boolean;
}): boolean {
  const { isAuthenticated, user } = useAuthStore.getState();

  if (!isAuthenticated || !user) {
    return true;
  }

  const canonicalRole = normalizeCanonicalRole(user.role, user.is_staff);
  if (!canonicalRole || canonicalRole === "client") {
    return true;
  }

  toast.error("Client access is required for this action.", {
    id: COMMERCE_BLOCK_TOAST_ID,
    description:
      options?.actionLabel
        ? `${options.actionLabel} is only available for client accounts.`
        : "Cart, checkout, and wishlist actions are only available for client accounts.",
    duration: 4500,
  });

  if (options?.redirect !== false && typeof window !== "undefined") {
    const destination = getCanonicalDashboardPath(user.role, user.is_staff);
    window.setTimeout(() => {
      window.location.assign(destination);
    }, 150);
  }

  return false;
}
