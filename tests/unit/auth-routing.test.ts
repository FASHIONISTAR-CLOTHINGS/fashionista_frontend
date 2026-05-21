import { describe, expect, it } from "vitest";

import { getPostAuthRedirectPath } from "@/features/auth/lib/auth-routing";

describe("getPostAuthRedirectPath", () => {
  it("honors a safe public returnUrl for clients", () => {
    expect(
      getPostAuthRedirectPath({
        role: "client",
        returnUrl: "/products",
      }),
    ).toBe("/products");
  });

  it("honors a role-compatible client returnUrl", () => {
    expect(
      getPostAuthRedirectPath({
        role: "client",
        returnUrl: "/client/dashboard/orders",
      }),
    ).toBe("/client/dashboard/orders");
  });

  it("falls back when a client is given a vendor returnUrl", () => {
    expect(
      getPostAuthRedirectPath({
        role: "client",
        returnUrl: "/vendor/dashboard",
      }),
    ).toBe("/client/dashboard");
  });

  it("keeps vendors on setup until their profile exists", () => {
    expect(
      getPostAuthRedirectPath({
        role: "vendor",
        hasVendorProfile: false,
        returnUrl: "/vendor/dashboard/orders",
      }),
    ).toBe("/vendor/setup");
  });

  it("allows vendors back to vendor pages once onboarded", () => {
    expect(
      getPostAuthRedirectPath({
        role: "vendor",
        hasVendorProfile: true,
        returnUrl: "/vendor/dashboard/orders",
      }),
    ).toBe("/vendor/dashboard/orders");
  });

  it("rejects admin-only paths for non-admins", () => {
    expect(
      getPostAuthRedirectPath({
        role: "vendor",
        hasVendorProfile: true,
        returnUrl: "/admin-dashboard",
      }),
    ).toBe("/vendor/dashboard");
  });

  it("blocks protocol-relative returnUrl values", () => {
    expect(
      getPostAuthRedirectPath({
        role: "client",
        returnUrl: "//malicious.example.com",
      }),
    ).toBe("/client/dashboard");
  });
});
