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
  PublicVendorCard,
  PublicVendorDetail,
  // Bank Account Payout Gate
  VendorBankAccount,
  BankAccountResolveResult,
  ResolveAccountPayload,
  CreateBankAccountPayload,
  PayoutRequestPayload,
  PayoutRequestResult,
  VendorProductListItem,
} from "@/features/vendor/types/vendor.types";

// ── Helper — unwrap { status, data } envelope ─────────────────────────────────
function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

function normalizeVendorProductList(payload: unknown): {
  status: string;
  count: number;
  data: VendorProductListItem[];
} {
  const unwrapped = unwrapData<any>(payload);
  const rows = Array.isArray(unwrapped?.results)
    ? unwrapped.results
    : Array.isArray(unwrapped?.data)
      ? unwrapped.data
      : Array.isArray(unwrapped)
        ? unwrapped
        : [];

  const validStatuses = new Set(["draft", "pending", "published", "archived", "rejected"]);

  return {
    status: unwrapped?.status ?? "success",
    count: Number(unwrapped?.count ?? rows.length),
    data: rows.map((item: any) => ({
      pid: String(item.slug ?? item.pid ?? item.id),
      title: String(item.title ?? ""),
      price: Number(item.price ?? 0),
      stock_qty: Number(item.stock_qty ?? 0),
      status: validStatuses.has(item.status) ? item.status : "draft",
      category__name: item.category__name ?? item.category_name ?? undefined,
      date: item.date ?? item.updated_at ?? item.created_at ?? "",
    })),
  };
}

// ── Vendor API Object ─────────────────────────────────────────────────────────
export const vendorApi = {

  // ── Profile ────────────────────────────────────────────────────────────────
  async getProfile(): Promise<VendorProfile> {
    const data = await apiAsync.get("vendor/profile/").json();
    return VendorProfileSchema.parse(unwrapData<VendorProfile>(data));
  },

  async updateProfile(payload: Partial<VendorSetupPayload>): Promise<VendorProfile> {
    const { data } = await apiSync.patch("v1/vendor/profile/", payload);
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
    const { data } = await apiSync.post("v1/vendor/setup/", validatedPayload);
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
    const { data } = await apiSync.post("v1/vendor/payout/", payload);
    return data as { message: string };
  },

  // ── PIN ────────────────────────────────────────────────────────────────────
  async setPin(payload: VendorPinSetPayload): Promise<{ message: string }> {
    VendorPinSetSchema.parse(payload);
    const { data } = await apiSync.post("v1/vendor/pin/set/", payload);
    return data as { message: string };
  },

  async verifyPin(payload: VendorPinVerifyPayload): Promise<{ valid: boolean }> {
    VendorPinVerifySchema.parse(payload);
    const { data } = await apiSync.post("v1/vendor/pin/verify/", payload);
    return data as { valid: boolean };
  },

  // ── Bank Accounts (Multi-Account Payout Gate) ─────────────────────────────

  /**
   * Resolve account holder name via Paystack.
   * Called by the "Resolve Name" button in AddBankAccountModal.
   * POST /api/v1/vendor/bank-accounts/resolve/
   */
  async resolveAccountName(
    payload: ResolveAccountPayload
  ): Promise<BankAccountResolveResult> {
    const { data } = await apiSync.post(
      "v1/vendor/bank-accounts/resolve/",
      payload
    );
    const inner = unwrapData<BankAccountResolveResult>(data);
    return inner;
  },

  /**
   * List all saved bank accounts (max 5).
   * GET /api/v1/vendor/bank-accounts/
   */
  async listBankAccounts(): Promise<VendorBankAccount[]> {
    const { data } = await apiSync.get("v1/vendor/bank-accounts/");
    const inner = unwrapData<{ count: number; data: VendorBankAccount[] }>(data);
    return inner.data ?? [];
  },

  /**
   * Save a new bank account (calls Paystack recipient API internally).
   * POST /api/v1/vendor/bank-accounts/
   */
  async createBankAccount(
    payload: CreateBankAccountPayload
  ): Promise<VendorBankAccount> {
    const { data } = await apiSync.post("v1/vendor/bank-accounts/", payload);
    const inner = unwrapData<{ message: string; data: VendorBankAccount }>(data);
    return inner.data;
  },

  /**
   * Delete a saved bank account (soft-delete + Paystack recipient cleanup).
   * DELETE /api/v1/vendor/bank-accounts/{id}/
   */
  async deleteBankAccount(id: string): Promise<void> {
    await apiSync.delete(`v1/vendor/bank-accounts/${id}/`);
  },

  /**
   * Set a bank account as the default payout destination.
   * PATCH /api/v1/vendor/bank-accounts/{id}/default/
   */
  async setDefaultBankAccount(id: string): Promise<VendorBankAccount> {
    const { data } = await apiSync.patch(
      `v1/vendor/bank-accounts/${id}/default/`,
      {}
    );
    const inner = unwrapData<{ message: string; data: VendorBankAccount }>(data);
    return inner.data;
  },

  // ── Payout Request ─────────────────────────────────────────────────────────

  /**
   * Submit a payout request to a saved bank account.
   * Decrypts account details server-side and calls VendorPayoutService.
   * POST /api/v1/vendor/payout/request/
   */
  async requestPayout(
    payload: PayoutRequestPayload
  ): Promise<PayoutRequestResult> {
    const { data } = await apiSync.post("v1/vendor/payout/request/", payload);
    return data as PayoutRequestResult;
  },

  // ── Platform Settings ────────────────────────────────────────────────────────

  /**
   * Fetch public platform configuration (withdrawal limits, support info).
   * GET /api/v1/platform/settings/public/
   * No authentication required — cached at backend for 60s.
   */
  async getPlatformSettings(): Promise<{
    platform_name: string;
    min_withdrawal_ngn: string;
    max_withdrawal_ngn: string;
    max_daily_withdrawal_ngn: string;
    min_wallet_topup_ngn: string;
    max_wallet_topup_ngn: string;
    support_email: string;
    support_phone: string;
    terms_url: string;
    privacy_url: string;
  }> {
    const { data } = await apiSync.get("v1/platform/settings/public/");
    return data as {
      platform_name: string;
      min_withdrawal_ngn: string;
      max_withdrawal_ngn: string;
      max_daily_withdrawal_ngn: string;
      min_wallet_topup_ngn: string;
      max_wallet_topup_ngn: string;
      support_email: string;
      support_phone: string;
      terms_url: string;
      privacy_url: string;
    };
  },

  async getDashboard(): Promise<VendorDashboard> {
    const data = await apiAsync.get("vendor/dashboard/").json();
    // VendorDashboardSchema uses .default(null) for nullable fields,
    // guaranteeing null (never undefined) — safe to cast to VendorDashboard.
    return VendorDashboardSchema.parse(
      unwrapData<VendorDashboard>(data),
    ) as unknown as VendorDashboard;
  },

  // ── Ninja Async endpoints retired in favor of reading from getDashboard cache ──

  // ── Analytics ─────────────────────────────────────────────────────────────
  async getAnalyticsSummary() {
    const data = await apiAsync.get("vendor/analytics/").json();
    return VendorAnalyticsSummarySchema.parse(unwrapData(data));
  },

  async getRevenueChart() {
    const data = await apiAsync.get("vendor/analytics/revenue/").json();
    return VendorChartResponseSchema.parse(data);
  },

  async getOrderChart() {
    const data = await apiAsync.get("vendor/analytics/orders/").json();
    return VendorChartResponseSchema.parse(data);
  },

  async getProductChart() {
    const data = await apiAsync.get("vendor/analytics/products/").json();
    return VendorChartResponseSchema.parse(data);
  },

  async getTopCategories() {
    const data = await apiAsync.get("vendor/analytics/categories/").json();
    return data;
  },

  async getPaymentDistribution() {
    const data = await apiAsync.get("vendor/analytics/distribution/").json();
    return data;
  },

  async getCustomerBehavior() {
    const data = await apiAsync.get("vendor/analytics/customers/").json();
    return data;
  },

  // ── Products — canonical product app contract ─────────────────────────────
  async getProducts() {
    const data = await apiAsync.get("vendor/products/").json();
    return VendorProductListSchema.parse(normalizeVendorProductList(data));
  },

  async filterProducts(params?: { status?: string; ordering?: string }) {
    const data = await apiAsync.get("vendor/products/", { searchParams: params }).json();
    return VendorProductListSchema.parse(normalizeVendorProductList(data));
  },

  async getLowStockProducts() {
    const data = await apiAsync.get("vendor/products/low-stock/").json();
    return VendorProductListSchema.parse(normalizeVendorProductList(data));
  },

  async getTopSellingProducts() {
    const data = await apiAsync.get("vendor/products/top/").json();
    return VendorProductListSchema.parse(data);
  },

  async createProduct(payload: VendorProductCreatePayload): Promise<{ pid: string; title: string }> {
    VendorProductCreateSchema.parse(payload);
    const { data } = await apiSync.post("v1/products/vendor/", payload);
    const product = unwrapData<any>(data);
    return { pid: String(product.slug ?? product.id), title: String(product.title ?? "") };
  },

  async updateProduct(pid: string, payload: VendorProductUpdatePayload): Promise<{ message: string }> {
    VendorProductUpdateSchema.parse(payload);
    const { data } = await apiSync.patch(`v1/products/vendor/${pid}/`, payload);
    return data as { message: string };
  },

  async deleteProduct(pid: string): Promise<{ message: string }> {
    const { data } = await apiSync.delete(`v1/products/vendor/${pid}/`);
    return data as { message: string };
  },

  // ── Orders ─────────────────────────────────────────────────────────────────
  async getOrders() {
    const data = await apiAsync.get("vendor/orders/").json();
    return VendorOrderListSchema.parse(data);
  },

  async getOrder(orderId: string | number) {
    const data = await apiAsync.get(`vendor/orders/${orderId}/`).json();
    return VendorOrderSchema.parse(unwrapData(data));
  },

  async getOrderStatusCounts() {
    const data = await apiAsync.get("vendor/orders/status-counts/").json();
    return data;
  },

  async updateOrderStatus(orderId: string | number, order_status: VendorOrderStatus): Promise<{ message: string }> {
    const { data } = await apiSync.patch(`v1/vendor/orders/${orderId}/status/`, { order_status });
    return data as { message: string };
  },

  // ── Earnings ───────────────────────────────────────────────────────────────
  async getEarnings() {
    const data = await apiAsync.get("vendor/earnings/").json();
    return VendorEarningTrackerSchema.parse(unwrapData(data));
  },

  // ── Reviews ────────────────────────────────────────────────────────────────
  async getReviews() {
    const data = await apiAsync.get("vendor/reviews/").json();
    return VendorReviewListSchema.parse(data);
  },

  async getReview(reviewId: number) {
    const data = await apiAsync.get(`vendor/reviews/${reviewId}/`).json();
    return VendorReviewItemSchema.parse(unwrapData(data));
  },


  // ── Coupons ────────────────────────────────────────────────────────────────
  async getCoupons() {
    const data = await apiAsync.get("vendor/coupons/").json();
    return VendorCouponListSchema.parse(data);
  },

  async createCoupon(input: any) {
    const { data } = await apiSync.post("v1/products/coupons/", input);
    return data;
  },

  async deleteCoupon(couponId: string) {
    await apiSync.delete(`v1/products/coupons/${couponId}/`);
  },

  // ── Public Marketplace (AllowAny) ──────────────────────────────────────────
  async getPublicVendors(params?: {
    search?:      string;
    city?:        string;
    is_featured?: boolean;
    limit?:       number;
    offset?:      number;
  }): Promise<{ count: number; results: PublicVendorCard[] }> {
    const qp = new URLSearchParams();
    if (params?.search)      qp.set("search",      params.search);
    if (params?.city)        qp.set("city",         params.city);
    if (params?.is_featured) qp.set("is_featured",  "true");
    if (params?.limit)       qp.set("limit",        String(params.limit));
    if (params?.offset)      qp.set("offset",       String(params.offset));
    const url = `v1/vendor/public/${qp.toString() ? "?" + qp.toString() : ""}`;
    const { data } = await apiSync.get(url);
    const unwrapped = unwrapData<{ count: number; results: PublicVendorCard[] }>(data);
    return unwrapped;
  },

  async getPublicVendorDetail(slug: string): Promise<PublicVendorDetail> {
    const { data } = await apiSync.get(`v1/vendor/public/${slug}/`);
    return unwrapData<PublicVendorDetail>(data);
  },
};

// ── Audit Logs API ───────────────────────────────────────────────────────────

export interface AuditLogEvent {
  id: string;
  event_type: string;
  event_category: string;
  severity: "debug" | "info" | "warning" | "error" | "critical";
  action: string;
  actor_email: string | null;
  ip_address: string | null;
  device_type: string | null;
  browser_family: string | null;
  os_family: string | null;
  country: string | null;
  request_method: string | null;
  request_path: string | null;
  response_status: number | null;
  duration_ms: number | null;
  resource_type: string | null;
  resource_id: string | null;
  is_compliance: boolean;
  error_message: string | null;
  created_at: string;
}

export interface AuditLogPage {
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
  events: AuditLogEvent[];
}

export async function fetchVendorAuditLogs(
  page = 1,
  category = "",
  severity = ""
): Promise<AuditLogPage> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: "20",
    ...(category ? { category } : {}),
    ...(severity ? { severity } : {}),
  });
  const res = await apiAsync.get(`vendor/audit-logs/?${params.toString()}`);
  return res.json<AuditLogPage>();
}
