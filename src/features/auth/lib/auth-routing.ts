import type { CanonicalRole } from "@/features/auth/lib/auth.types";
import { normalizeCanonicalRole } from "@/features/auth/lib/auth-roles";

export { normalizeCanonicalRole } from "@/features/auth/lib/auth-roles";

type RedirectAudience = "public" | "commerce_only" | CanonicalRole;

/**
 * Commerce-only path prefixes — pages that are exclusively for CLIENT users.
 *
 * SECURITY CONTRACT: Admin and Vendor users must NEVER be redirected to
 * these pages, even if a `returnUrl` parameter carries one of these paths.
 *
 * WHY THIS EXISTS:
 * The auth system previously classified these as "public" paths (accessible
 * to any logged-in user), which meant an admin browsing the site and getting
 * redirected to /auth/sign-in with ?returnUrl=/cart/checkout would be sent
 * BACK to checkout after logging in — despite being an admin. This caused:
 *   • Admins creating ₦0 orders (optimistic UI + deferred backend 403)
 *   • Cart/wishlist state leaking into admin sessions
 *   • UX confusion (admin dropdown shows "Admin" but page is checkout)
 *
 * Remedy: returnUrls matching these prefixes are REJECTED for admin/vendor.
 * They are redirected to their canonical dashboard instead.
 */
const COMMERCE_ONLY_PREFIXES: readonly string[] = [
  "/cart",
  "/checkout",
  "/wishlist",
  "/orders",       // order creation/detail pages that require client auth
];

/**
 * Paths that staff/admin roles MAY visit as returnUrl.
 * These are public browsing pages they legitimately browse (product pages,
 * collections, about, blog, vendor listings, etc.).
 */
function isSafeRelativeReturnUrl(path?: string | null): path is string {
  return Boolean(path && path.startsWith("/") && !path.startsWith("//"));
}

function isCommerceOnlyPath(path: string): boolean {
  return COMMERCE_ONLY_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function getRedirectAudience(path: string): RedirectAudience {
  // Commerce-only paths — only clients are allowed here
  if (isCommerceOnlyPath(path)) {
    return "commerce_only";
  }

  if (path.startsWith("/admin-dashboard")) {
    return "admin";
  }

  if (path.startsWith("/vendor")) {
    return "vendor";
  }

  if (path.startsWith("/client/dashboard")) {
    return "client";
  }

  return "public";
}

/**
 * Resolves a returnUrl to one that is compatible with the authenticated user's role.
 *
 * ROLE MATRIX:
 *   • client  → can follow any safe returnUrl (public, commerce_only, /client/*)
 *   • vendor  → can follow public pages and /vendor/*; blocked from commerce_only
 *   • admin   → can follow public pages and /admin-dashboard/*; blocked from commerce_only
 *
 * If the returnUrl is incompatible (role-mismatch, commerce-only for non-client,
 * restricted dashboard for wrong role), returns null and the caller falls back
 * to the canonical dashboard path for that role.
 *
 * OPEN REDIRECT PREVENTION: Only safe relative paths (starting with "/")
 * are accepted — never protocol-relative (//) or absolute URLs.
 */
function resolveRoleCompatibleReturnUrl({
  canonicalRole,
  hasVendorProfile,
  returnUrl,
}: {
  canonicalRole: CanonicalRole;
  hasVendorProfile: boolean;
  returnUrl?: string | null;
}): string | null {
  if (!isSafeRelativeReturnUrl(returnUrl)) {
    return null;
  }

  const audience = getRedirectAudience(returnUrl);

  // ── Commerce-only paths (cart, checkout, wishlist, orders) ──────────────────
  // Only CLIENT users may follow these returnUrls.
  // Admin/vendor who were browsing the site as guests and get redirected to
  // /auth/sign-in must land on THEIR dashboard — not the checkout page.
  if (audience === "commerce_only") {
    return canonicalRole === "client" ? returnUrl : null;
  }

  // ── Public pages (home, products, blog, about, etc.) ────────────────────────
  // Any authenticated role may follow a returnUrl pointing to a public page.
  // This allows admin/vendor to continue browsing product/collection pages
  // they were viewing before they clicked sign-in.
  if (audience === "public") {
    return returnUrl;
  }

  // ── Dashboard-specific paths ─────────────────────────────────────────────────

  if (audience === "admin") {
    return canonicalRole === "admin" ? returnUrl : null;
  }

  if (audience === "client") {
    return canonicalRole === "client" ? returnUrl : null;
  }

  // audience === "vendor"
  if (canonicalRole !== "vendor") {
    return null;
  }

  if (hasVendorProfile) {
    return returnUrl;
  }

  return returnUrl === "/vendor/setup" ? returnUrl : null;
}

export function getCanonicalDashboardPath(
  role?: string | null,
  isStaff = false,
): string {
  const canonicalRole = normalizeCanonicalRole(role, isStaff);

  if (canonicalRole === "admin") {
    return "/admin-dashboard";
  }

  if (canonicalRole === "vendor") {
    return "/vendor/dashboard";
  }

  return "/client/dashboard";
}

/**
 * Determines the correct post-authentication redirect path for a user.
 *
 * Priority order:
 *   1. Role-compatible returnUrl (if provided and valid for the user's role)
 *   2. Canonical dashboard for the user's role (fallback)
 *
 * SECURITY: Commerce paths (cart/checkout/wishlist) are NEVER returned for
 * admin or vendor roles, even if a returnUrl targets them. Admins and vendors
 * must always land on their own dashboards.
 *
 * ANTI-REDIRECT ABUSE: returnUrl is validated to be a safe relative path
 * before use. External URLs and protocol-relative paths are rejected.
 */
export function getPostAuthRedirectPath({
  role,
  isStaff = false,
  hasVendorProfile = true,
  returnUrl,
}: {
  role?: string | null;
  isStaff?: boolean;
  hasVendorProfile?: boolean;
  returnUrl?: string | null;
}): string {
  const canonicalRole = normalizeCanonicalRole(role, isStaff) ?? "client";
  const compatibleReturnUrl = resolveRoleCompatibleReturnUrl({
    canonicalRole,
    hasVendorProfile,
    returnUrl,
  });

  if (compatibleReturnUrl) {
    return compatibleReturnUrl;
  }

  if (canonicalRole === "admin") {
    return "/admin-dashboard";
  }

  if (canonicalRole === "vendor") {
    return hasVendorProfile ? "/vendor/dashboard" : "/vendor/setup";
  }

  return "/client/dashboard";
}

export function isRoleAllowed(
  requiredRole: CanonicalRole | CanonicalRole[],
  actualRole?: CanonicalRole,
): boolean {
  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return Boolean(actualRole && allowedRoles.includes(actualRole));
}

/**
 * Returns true if the given path is a commerce-only path that admin/vendor
 * users should be blocked from accessing.
 *
 * Used by:
 *   - Route middleware (proxy.ts) to block URL-level access
 *   - Cart/wishlist API calls to prevent merge for non-client users
 */
export { isCommerceOnlyPath };
