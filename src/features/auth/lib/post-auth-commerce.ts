import { normalizeCanonicalRole } from "@/features/auth/lib/auth-routing";

/**
 * Guest cart and wishlist restoration is a client-only post-auth behavior.
 * Admin and vendor sessions should redirect immediately to their dashboards
 * without triggering commerce merge side effects.
 */
export function shouldMergeAnonymousCommerceForRole(options: {
  role?: string | null;
  isStaff?: boolean;
}): boolean {
  return normalizeCanonicalRole(options.role, options.isStaff) === "client";
}
