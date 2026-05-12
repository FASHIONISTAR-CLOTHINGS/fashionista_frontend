import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_PAGES = new Set([
  "/auth/sign-in",
  "/auth/choose-role",
  "/auth/sign-up",
  "/auth/forgot-password",
  "/auth/verify-otp",
]);

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
  ["/orders", "/vendor/orders"],
]);

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
  const legacyDestination = LEGACY_REDIRECTS.get(pathname);

  if (legacyDestination) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = legacyDestination;
    redirectUrl.search = search;
    return withSecurityHeaders(NextResponse.redirect(redirectUrl));
  }

  const authHint = request.cookies.get("fashionistar_auth_hint")?.value;
  const roleHint = request.cookies.get("fashionistar_role")?.value;

  if (authHint === "1" && AUTH_PAGES.has(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = getDashboardPath(roleHint);
    redirectUrl.search = "";
    return withSecurityHeaders(NextResponse.redirect(redirectUrl));
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|txt|xml)$).*)",
  ],
};
