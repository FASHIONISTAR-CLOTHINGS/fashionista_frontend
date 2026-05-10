// features/vendor/api/vendor.api.ts
/**
 * Vendor API Client — Full Production Contract.
 *
 * Aligns exactly with backend /api/v1/vendor/* (DRF sync) and
 * /api/v1/ninja/vendor/* (Ninja async) endpoints.
 *
 * All responses are validated with Zod schemas before returning.
 * apiSync  → Axios (DRF sync endpoints, standard REST)
 * apiAsync → Ky   (Ninja async endpoints, high-throughput)
 */
import { apiAsync } from "@/core/api/client.async";
import { apiSync } from "@/core/api/client.sync";
import {
  VendorAnalyticsSummarySchema,
  VendorChartResponseSchema,
  VendorCouponListSchema,
  VendorDashboardSchema,
  VendorEarningTrackerSchema,
  VendorOrderListSchema,
  VendorOrderSchema,
  VendorPayoutSchema,
  VendorPinSetSchema,
  VendorPinVerifySchema,
  VendorProductCreateSchema,
  VendorProductListSchema,
  VendorProductUpdateSchema,
  VendorProfileSchema,
  VendorReviewItemSchema,
  VendorReviewListSchema,
  VendorSetupSchema,
  VendorSetupStateSchema,
} from "@/features/vendor/schemas/vendor.schemas";
import type {
  VendorDashboard,
  VendorOrderStatus,
  VendorPayoutPayload,
  VendorPinSetPayload,
  VendorPinVerifyPayload,
  VendorProductCreatePayload,
  VendorProductUpdatePayload,
  VendorProfile,
  VendorSetupPayload,
  VendorSetupState,
} from "@/features/vendor/types/vendor.types";

// ── Helper — unwrap { status, data } envelope ─────────────────────────────────
function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

// ── Vendor API Object ─────────────────────────────────────────────────────────
export const vendorApi = {

  // ── Profile ────────────────────────────────────────────────────────────────
  async getProfile(): Promise<VendorProfile> {
    const data = await apiAsync.get("vendor/profile/").json();
    return VendorProfileSchema.parse(unwrapData<VendorProfile>(data));
  },

  async updateProfile(payload: Partial<VendorSetupPayload>): Promise<VendorProfile> {
    const { data } = await apiSync.patch("/v1/vendor/profile/", payload);
    return VendorProfileSchema.parse(unwrapData<VendorProfile>(data));
  },

  // ── Setup / Onboarding ─────────────────────────────────────────────────────
  async getSetupState(): Promise<VendorSetupState> {
    const data = await apiAsync.get("vendor/setup/").json();
    return VendorSetupStateSchema.parse(unwrapData<VendorSetupState>(data));
  },

  async submitSetup(payload: VendorSetupPayload): Promise<{
    profile: VendorProfile;
    setup_state: VendorSetupState | null;
  }> {
    const validatedPayload = VendorSetupSchema.parse(payload);
    const { data } = await apiSync.post("/v1/vendor/setup/", validatedPayload);
    const unwrapped = unwrapData<{
      profile: VendorProfile;
      setup_state: VendorSetupState | null;
    }>(data);
    return {
      profile: VendorProfileSchema.parse(unwrapped.profile),
      setup_state: unwrapped.setup_state
        ? VendorSetupStateSchema.parse(unwrapped.setup_state)
        : null,
    };
  },

  // ── Payout ─────────────────────────────────────────────────────────────────
  async savePayout(payload: VendorPayoutPayload): Promise<{ message: string }> {
    VendorPayoutSchema.parse(payload);
    const { data } = await apiSync.post("/v1/vendor/payout/", payload);
    return data as { message: string };
  },

  // ── PIN ────────────────────────────────────────────────────────────────────
  async setPin(payload: VendorPinSetPayload): Promise<{ message: string }> {
    VendorPinSetSchema.parse(payload);
    const { data } = await apiSync.post("/v1/vendor/pin/set/", payload);
    return data as { message: string };
  },

  async verifyPin(payload: VendorPinVerifyPayload): Promise<{ valid: boolean }> {
    VendorPinVerifySchema.parse(payload);
    const { data } = await apiSync.post("/v1/vendor/pin/verify/", payload);
    return data as { valid: boolean };
  },

  // ── Dashboard (Async / Ninja) ──────────────────────────────────────────────
  async getDashboard(): Promise<VendorDashboard> {
    const data = await apiAsync.get("vendor/dashboard/").json();
    return VendorDashboardSchema.parse(data);
  },

  // ── Ninja Async endpoints (backed by VendorProfile DB-layer classmethods) ──

  async getNinjaOrderStats(): Promise<{
    total_orders: number;
    total_revenue: number;
    pending_count: number;
    active_count: number;
  }> {
    const data = await apiAsync.get("vendor/order-stats/").json();
    return data as {
      total_orders: number;
      total_revenue: number;
      pending_count: number;
      active_count: number;
    };
  },

  async getNinjaRecentOrders(
    limit: number = 10,
  ): Promise<Array<{
    id: number;
    total: number;
    payment_status: string;
    date: string;
    order_status: string;
  }>> {
    const data = await apiAsync
      .get(`vendor/recent-orders/?limit=${limit}`)
      .json();
    return data as Array<{
      id: number;
      total: number;
      payment_status: string;
      date: string;
      order_status: string;
    }>;
  },

  async getNinjaProductSummary(
    limit: number = 10,
  ): Promise<Array<{
    id: string;
    title: string;
    price: number;
    stock_qty: number;
    status: string;
  }>> {
    const data = await apiAsync
      .get(`vendor/products-summary/?limit=${limit}`)
      .json();
    return data as Array<{
      id: string;
      title: string;
      price: number;
      stock_qty: number;
      status: string;
    }>;
  },

  async getNinjaWalletData(): Promise<{
    balance: number;
    recent_transactions: Array<{
      amount: number;
      transaction_type: string;
      date: string;
      description: string;
    }>;
  }> {
    const data = await apiAsync.get("vendor/wallet/").json();
    return data as {
      balance: number;
      recent_transactions: Array<{
        amount: number;
        transaction_type: string;
        date: string;
        description: string;
      }>;
    };
  },

  async getNinjaTopSellingProducts(
    limit: number = 5,
  ): Promise<Array<{
    id: string;
    title: string;
    price: number;
    stock_qty: number;
    total_qty: number | null;
  }>> {
    const data = await apiAsync
      .get(`vendor/top-products/?limit=${limit}`)
      .json();
    return data as Array<{
      id: string;
      title: string;
      price: number;
      stock_qty: number;
      total_qty: number | null;
    }>;
  },

  async getNinjaCouponStats(): Promise<{ active: number; inactive: number }> {
    const data = await apiAsync.get("vendor/coupon-stats/").json();
    return data as { active: number; inactive: number };
  },

  // ── Analytics ─────────────────────────────────────────────────────────────
  async getAnalyticsSummary() {
    const { data } = await apiSync.get("/v1/vendor/analytics/");
    return VendorAnalyticsSummarySchema.parse(unwrapData(data));
  },

  async getRevenueChart() {
    const { data } = await apiSync.get("/v1/vendor/analytics/revenue/");
    return VendorChartResponseSchema.parse(data);
  },

  async getOrderChart() {
    const { data } = await apiSync.get("/v1/vendor/analytics/orders/");
    return VendorChartResponseSchema.parse(data);
  },

  async getProductChart() {
    const { data } = await apiSync.get("/v1/vendor/analytics/products/");
    return VendorChartResponseSchema.parse(data);
  },

  async getTopCategories() {
    const { data } = await apiSync.get("/v1/vendor/analytics/categories/");
    return data;
  },

  async getPaymentDistribution() {
    const { data } = await apiSync.get("/v1/vendor/analytics/distribution/");
    return data;
  },

  async getCustomerBehavior() {
    const { data } = await apiSync.get("/v1/vendor/analytics/customers/");
    return data;
  },

  // ── Products ───────────────────────────────────────────────────────────────
  async getProducts() {
    const { data } = await apiSync.get("/v1/vendor/products/");
    return VendorProductListSchema.parse(data);
  },

  async filterProducts(params?: { status?: string; ordering?: string }) {
    const { data } = await apiSync.get("/v1/vendor/products/filter/", { params });
    return VendorProductListSchema.parse(data);
  },

  async getLowStockProducts() {
    const { data } = await apiSync.get("/v1/vendor/products/low-stock/");
    return VendorProductListSchema.parse(data);
  },

  async getTopSellingProducts() {
    const { data } = await apiSync.get("/v1/vendor/products/top/");
    return VendorProductListSchema.parse(data);
  },

  async createProduct(payload: VendorProductCreatePayload): Promise<{ pid: string; title: string }> {
    VendorProductCreateSchema.parse(payload);
    const { data } = await apiSync.post("/v1/vendor/products/create/", payload);
    return unwrapData<{ pid: string; title: string }>(data);
  },

  async updateProduct(pid: string, payload: VendorProductUpdatePayload): Promise<{ message: string }> {
    VendorProductUpdateSchema.parse(payload);
    const { data } = await apiSync.patch(`/v1/vendor/products/${pid}/edit/`, payload);
    return data as { message: string };
  },

  async deleteProduct(pid: string): Promise<{ message: string }> {
    const { data } = await apiSync.delete(`/v1/vendor/products/${pid}/delete/`);
    return data as { message: string };
  },

  // ── Orders ─────────────────────────────────────────────────────────────────
  async getOrders() {
    const { data } = await apiSync.get("/v1/vendor/orders/");
    return VendorOrderListSchema.parse(data);
  },

  async getOrder(orderId: number) {
    const { data } = await apiSync.get(`/v1/vendor/orders/${orderId}/`);
    return VendorOrderSchema.parse(unwrapData(data));
  },

  async getOrderStatusCounts() {
    const { data } = await apiSync.get("/v1/vendor/orders/status-counts/");
    return data;
  },

  async updateOrderStatus(orderId: number, order_status: VendorOrderStatus): Promise<{ message: string }> {
    const { data } = await apiSync.patch(`/v1/vendor/orders/${orderId}/status/`, { order_status });
    return data as { message: string };
  },

  // ── Earnings ───────────────────────────────────────────────────────────────
  async getEarnings() {
    const { data } = await apiSync.get("/v1/vendor/earnings/");
    return VendorEarningTrackerSchema.parse(unwrapData(data));
  },

  // ── Reviews ────────────────────────────────────────────────────────────────
  async getReviews() {
    const { data } = await apiSync.get("/v1/vendor/reviews/");
    return VendorReviewListSchema.parse(data);
  },

  async getReview(reviewId: number) {
    const { data } = await apiSync.get(`/v1/vendor/reviews/${reviewId}/`);
    return VendorReviewItemSchema.parse(unwrapData(data));
  },

  // ── Coupons ────────────────────────────────────────────────────────────────
  async getCoupons() {
    const { data } = await apiSync.get("/v1/vendor/coupons/");
    return VendorCouponListSchema.parse(data);
  },
};
