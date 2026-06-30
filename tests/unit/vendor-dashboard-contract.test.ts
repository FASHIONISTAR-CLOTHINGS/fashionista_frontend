import { describe, expect, it, vi } from "vitest";

const dashboardPayload = {
  profile: {
    id: "vendor-profile-1",
    store_name: "Atelier Ada",
    store_slug: "atelier-ada",
    tagline: "Tailored pieces for Lagos nights",
    logo_url: "https://cdn.example/logo.jpg",
    cover_url: "https://cdn.example/cover.jpg",
    city: "Lagos",
    state: "Lagos",
    country: "NG",
    is_verified: true,
    is_active: true,
    is_featured: false,
  },
  analytics: {
    total_products: 12,
    total_sales: 34,
    total_revenue: 245000,
    average_rating: 4.8,
    review_count: 9,
  },
  setup_state: {
    current_step: 4,
    profile_complete: true,
    bank_details: true,
    id_verified: true,
    first_product: true,
    onboarding_done: true,
    completion_percentage: 100,
  },
  payout_profile: {
    bank_name: "Fashion Bank",
    bank_code: "999",
    account_name: "Ada Atelier Ltd",
    account_last4: "6789",
    paystack_recipient_code: "RCP_live_123",
    is_verified: true,
  },
  recent_orders: [
    {
      id: 51,
      oid: "ORD-2051",
      buyer_email: "client@example.com",
      buyer_full_name: "Client Example",
      order_status: "Processing",
      payment_status: "paid",
      total_price: 45000,
      date: "2026-05-20T10:00:00Z",
    },
  ],
  products: [
    {
      pid: "prod-1",
      title: "Silk Wrap Dress",
      price: 75000,
      stock_qty: 8,
      status: "published",
      category__name: "Dresses",
      date: "2026-05-19T10:00:00Z",
    },
  ],
  reviews: [
    {
      id: 7,
      product_title: "Silk Wrap Dress",
      product_pid: "prod-1",
      buyer_email: "client@example.com",
      rating: 5,
      review: "Beautiful finishing.",
      date: "2026-05-21T10:00:00Z",
    },
  ],
  coupons: {
    active: 2,
    inactive: 1,
  },
  wallet: {
    balance: 125000,
    recent_transactions: [
      {
        amount: 45000,
        transaction_type: "credit",
        date: "2026-05-20T12:00:00Z",
        description: "Order ORD-2051 payout credit",
      },
    ],
  },
  recent_activity: [
    {
      type: "order_paid",
      label: "Order ORD-2051 was paid",
      date: "2026-05-20T12:00:00Z",
    },
  ],
};

const apiAsyncGet = vi.fn(() => ({
  json: vi.fn(async () => ({ status: "success", data: dashboardPayload })),
}));

vi.mock("@/core/api/client.async", () => ({
  apiAsync: {
    get: apiAsyncGet,
  },
}));

vi.mock("@/core/api/client.sync", () => ({
  apiSync: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("vendor dashboard contract", () => {
  it("parses the async dashboard snapshot with payout, orders, products, reviews, coupons, wallet, and activity", async () => {
    const { VendorDashboardSchema } = await import("@/features/vendor/schemas/vendor.schemas");

    const parsed = VendorDashboardSchema.parse(dashboardPayload);

    // payout_profile uses account_last4 (masked) — never returns full account_number
    expect(parsed.payout_profile?.account_last4).toBe("6789");
    expect(parsed.recent_orders).toHaveLength(1);
    expect(parsed.products[0]?.title).toBe("Silk Wrap Dress");
    expect(parsed.reviews[0]?.rating).toBe(5);
    // coupons is a stats object {active, inactive} — NOT an array
    expect(parsed.coupons.active).toBe(2);
    expect(parsed.coupons.inactive).toBe(1);
    expect(parsed.wallet?.balance).toBe(125000);
    expect(parsed.recent_activity[0]).toMatchObject({ type: "order_paid" });

  });

  it("unwraps the backend envelope through vendorApi.getDashboard", async () => {
    const { vendorApi } = await import("@/features/vendor/api/vendor.api");

    const dashboard = await vendorApi.getDashboard();

    expect(apiAsyncGet).toHaveBeenCalledWith("vendor/dashboard/");
    expect(dashboard.profile.store_name).toBe("Atelier Ada");
    expect(dashboard.wallet?.recent_transactions[0]?.amount).toBe(45000);
  });
});
