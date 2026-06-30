import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LEGACY_REDIRECTS = new Map<string, string>([
  ["/auth", "/auth/sign-in"],
  ["/login", "/auth/sign-in"],
  ["/register", "/auth/choose-role"],
  ["/signup", "/auth/choose-role"],
  ["/sign-up", "/auth/choose-role"],
  ["/verify", "/auth/verify-otp"],
  ["/verify-otp", "/auth/verify-otp"],
  ["/forgot-password", "/auth/forgot-password"],
  ["/reset-password", "/auth/forgot-password"],
  ["/shop", "/shops"],
  ["/latest", "/collections"],
  ["/location", "/contact-us"],
  ["/pages", "/blog"],
  ["/client", "/client/dashboard"],
  ["/wallet", "/client/dashboard/wallet"],
  ["/orders", "/client/dashboard/orders"],
]);

/**
 * Commerce-only path prefixes — pages that are exclusively for CLIENT users.
 *
 * SECURITY CONTRACT: Admin and Vendor users must NEVER access these paths.
 * If they attempt to navigate here (e.g., via back button, direct URL entry,
 * or a stale bookmark), they are immediately redirected to their dashboard.
 *
 * This is the first line of defence (edge-level). A second defence exists
 * client-side via RoleGuard + auth-routing.ts resolveRoleCompatibleReturnUrl.
 */
const COMMERCE_ONLY_PREFIXES = ["/cart", "/checkout", "/wishlist", "/orders"] as const;

function getDashboardPath(roleCookie?: string | null) {
  const role = (roleCookie ?? "").trim().toLowerCase();

  if (role === "admin") {
    return "/admin-dashboard";
  }

  if (role === "vendor") {
    return "/vendor/dashboard";
  }

  return "/client/dashboard";
}

function isCommerceOnlyPath(pathname: string): boolean {
  return COMMERCE_ONLY_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function withSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(self), microphone=(), geolocation=(self)");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const authHint = request.cookies.get("fashionistar_auth_hint")?.value;
  const roleHint = request.cookies.get("fashionistar_role")?.value;
  const isAuthenticated = authHint === "1";
  const canonicalRole = (roleHint ?? "").trim().toLowerCase();

  // ── Commerce-Only Route Guard (Admin/Vendor → Dashboard) ────────────────────
  // Blocks admin and vendor users from accessing cart, checkout, wishlist,
  // and the legacy `/orders` client-commerce route at the EDGE — before any
  // redirect map or React route can take over.
  if (isAuthenticated && isCommerceOnlyPath(pathname)) {
    if (canonicalRole === "admin" || canonicalRole === "vendor") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = getDashboardPath(canonicalRole);
      redirectUrl.search = "";
      return withSecurityHeaders(NextResponse.redirect(redirectUrl));
    }
  }

  // ── Legacy URL redirects (permanent) ────────────────────────────────────────
  const legacyDestination = LEGACY_REDIRECTS.get(pathname);
  if (legacyDestination) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = legacyDestination;
    redirectUrl.search = search;
    return withSecurityHeaders(NextResponse.redirect(redirectUrl));
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|txt|xml)$).*)",
  ],
};
