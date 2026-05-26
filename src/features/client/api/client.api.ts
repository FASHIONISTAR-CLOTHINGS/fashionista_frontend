// features/client/api/client.api.ts
/**
 * Client API — Full Production Contract v2.
 *
 * Aligns exactly with backend /api/v1/client/* (DRF sync) and
 * /api/v1/ninja/client/* (Ninja async) endpoints.
 *
 * All responses validated with Zod schemas.
 * Updated: 2026-05-26 — Added CustomOrder, Wallet TopUp, live Orders, Countries
 */
import { apiAsync } from "@/core/api/client.async";
import { apiSync } from "@/core/api/client.sync";
import {
  ClientDashboardSchema,
  ClientProfileSchema,
  ClientProfileUpdateSchema,
} from "@/features/client/schemas/client.schemas";
import type {
  ClientAddress,
  ClientAddressCreatePayload,
  ClientDashboard,
  ClientNotification,
  ClientOrder,
  ClientProfile,
  ClientProfileUpdatePayload,
  Country,
  CustomOrder,
  CustomOrderCreatePayload,
  MilestonePayPayload,
  ProductReview,
  ReviewCreatePayload,
  SupportTicket,
  SupportTicketCreatePayload,
  WalletBalance,
  WalletTopUpPayload,
  WalletTopUpResponse,
  WalletTransferPayload,
  WalletTransferResponse,
  WishlistItem,
  WishlistToggleResponse,
} from "@/features/client/types/client.types";

// ── Helper ────────────────────────────────────────────────────────────────────
function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

// ── Client API Object ─────────────────────────────────────────────────────────
export const clientApi = {

  // ── Profile ────────────────────────────────────────────────────────────────
  async getProfile(): Promise<ClientProfile> {
    const data = await apiAsync.get("client/profile/").json();
    return ClientProfileSchema.parse(unwrapData<ClientProfile>(data));
  },

  async updateProfile(payload: ClientProfileUpdatePayload): Promise<ClientProfile> {
    const validatedPayload = ClientProfileUpdateSchema.parse(payload);
    const { data } = await apiSync.patch("v1/client/profile/", validatedPayload);
    return ClientProfileSchema.parse(unwrapData<ClientProfile>(data));
  },

  // ── Addresses ─────────────────────────────────────────────────────────────
  async getAddresses(): Promise<ClientAddress[]> {
    const data = await apiAsync.get("client/addresses/").json();
    return unwrapData<ClientAddress[]>(data);
  },

  async addAddress(payload: ClientAddressCreatePayload): Promise<ClientAddress> {
    const { data } = await apiSync.post("v1/client/addresses/", payload);
    return unwrapData<ClientAddress>(data);
  },

  async deleteAddress(addressId: string): Promise<{ message: string }> {
    const { data } = await apiSync.delete(`v1/client/addresses/${addressId}/`);
    return data as { message: string };
  },

  async setDefaultAddress(addressId: string): Promise<ClientAddress> {
    const { data } = await apiSync.post(`v1/client/addresses/${addressId}/set-default/`);
    return unwrapData<ClientAddress>(data);
  },

  // ── Orders ─────────────────────────────────────────────────────────────────
  async getOrders(params?: { status?: string; limit?: number }): Promise<ClientOrder[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.limit) searchParams.set("limit", String(params.limit));
    const query = searchParams.toString();
    const data = await apiAsync.get(`client/orders/${query ? `?${query}` : ""}`).json();
    return unwrapData<ClientOrder[]>(data);
  },

  async getOrder(orderId: string): Promise<ClientOrder> {
    const data = await apiAsync.get(`client/orders/${orderId}/`).json();
    return unwrapData<ClientOrder>(data);
  },

  // ── Custom Orders (Bespoke) ────────────────────────────────────────────────
  async getCustomOrders(params?: { status?: string }): Promise<CustomOrder[]> {
    const query = params?.status ? `?status=${params.status}` : "";
    const data = await apiAsync.get(`client/custom-orders/${query}`).json();
    return data as CustomOrder[];
  },

  async getCustomOrder(id: string): Promise<CustomOrder> {
    const data = await apiAsync.get(`client/custom-orders/${id}/`).json();
    return data as CustomOrder;
  },

  async createCustomOrder(payload: CustomOrderCreatePayload): Promise<CustomOrder> {
    const data = await apiAsync.post("client/custom-orders/", { json: payload }).json();
    return data as CustomOrder;
  },

  async payMilestone(customOrderId: string, payload: MilestonePayPayload): Promise<CustomOrder> {
    const data = await apiAsync
      .post(`client/custom-orders/${customOrderId}/pay-milestone/`, { json: payload })
      .json();
    return data as CustomOrder;
  },

  // ── Wishlist ───────────────────────────────────────────────────────────────
  async getWishlist(): Promise<WishlistItem[]> {
    const { data } = await apiSync.get("v1/client/wishlist/");
    return unwrapData<WishlistItem[]>(data);
  },

  async toggleWishlist(product_id: string): Promise<WishlistToggleResponse> {
    const { data } = await apiSync.post("v1/client/wishlist/toggle/", { product_id });
    return data as WishlistToggleResponse;
  },

  // ── Reviews ────────────────────────────────────────────────────────────────
  async getProductReviews(product_id: string): Promise<ProductReview[]> {
    const { data } = await apiSync.get(`v1/home/reviews/${product_id}/`);
    return unwrapData<ProductReview[]>(data);
  },

  async createReview(payload: ReviewCreatePayload): Promise<{ message: string }> {
    const { data } = await apiSync.post("v1/client/reviews/create/", payload);
    return data as { message: string };
  },

  // ── Wallet ─────────────────────────────────────────────────────────────────
  async getWalletBalance(): Promise<WalletBalance> {
    const { data } = await apiSync.get("v1/client/wallet/balance/");
    return unwrapData<WalletBalance>(data);
  },

  async transferFunds(payload: WalletTransferPayload): Promise<WalletTransferResponse> {
    const { data } = await apiSync.post("v1/client/wallet/transfer/", payload);
    return data as WalletTransferResponse;
  },

  async initiateTopUp(payload: WalletTopUpPayload): Promise<WalletTopUpResponse> {
    const { data } = await apiSync.post("v1/client/wallet/topup/initiate/", payload);
    return unwrapData<WalletTopUpResponse>(data);
  },

  // ── Support Tickets ────────────────────────────────────────────────────────
  async getSupportTickets(): Promise<SupportTicket[]> {
    const data = await apiAsync.get("support/tickets/").json();
    return unwrapData<SupportTicket[]>(data);
  },

  async createSupportTicket(payload: SupportTicketCreatePayload): Promise<SupportTicket> {
    const data = await apiAsync.post("support/tickets/", { json: payload }).json();
    return unwrapData<SupportTicket>(data);
  },

  // ── Notifications ──────────────────────────────────────────────────────────
  async getNotifications(unreadOnly = false): Promise<ClientNotification[]> {
    const query = unreadOnly ? "?unread=true" : "";
    const data = await apiAsync.get(`client/notifications/${query}`).json();
    return unwrapData<ClientNotification[]>(data);
  },

  async markNotificationRead(id: string): Promise<void> {
    await apiAsync.post(`client/notifications/${id}/read/`).json();
  },

  async markAllNotificationsRead(): Promise<void> {
    await apiAsync.post("client/notifications/mark-all-read/").json();
  },

  // ── Reference Data ─────────────────────────────────────────────────────────
  async getCountries(): Promise<Country[]> {
    const data = await apiAsync.get("common/countries/").json();
    return unwrapData<Country[]>(data);
  },

  // ── Dashboard (Async / Ninja) ──────────────────────────────────────────────
  async getDashboard(): Promise<ClientDashboard> {
    const data = await apiAsync.get("client/dashboard/").json();
    return ClientDashboardSchema.parse(data);
  },
};
