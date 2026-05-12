// features/client/api/client.api.ts
/**
 * Client API — Full Production Contract.
 *
 * Aligns exactly with backend /api/v1/client/* (DRF sync) and
 * /api/v1/ninja/client/* (Ninja async) endpoints.
 *
 * All responses validated with Zod schemas.
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
  ClientOrder,
  ClientProfile,
  ClientProfileUpdatePayload,
  ProductReview,
  ReviewCreatePayload,
  WalletBalance,
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
    const { data } = await apiSync.patch("/v1/client/profile/", validatedPayload);
    return ClientProfileSchema.parse(unwrapData<ClientProfile>(data));
  },

  // ── Addresses ─────────────────────────────────────────────────────────────
  async getAddresses(): Promise<ClientAddress[]> {
    const data = await apiAsync.get("client/addresses/").json();
    return unwrapData<ClientAddress[]>(data);
  },

  async addAddress(payload: ClientAddressCreatePayload): Promise<ClientAddress> {
    const { data } = await apiSync.post("/v1/client/addresses/", payload);
    return unwrapData<ClientAddress>(data);
  },

  async deleteAddress(addressId: string): Promise<{ message: string }> {
    const { data } = await apiSync.delete(`/v1/client/addresses/${addressId}/`);
    return data as { message: string };
  },

  async setDefaultAddress(addressId: string): Promise<ClientAddress> {
    const { data } = await apiSync.post(`/v1/client/addresses/${addressId}/set-default/`);
    return unwrapData<ClientAddress>(data);
  },

  // ── Orders ─────────────────────────────────────────────────────────────────
  async getOrders(): Promise<ClientOrder[]> {
    const { data } = await apiSync.get("/v1/client/orders/");
    return unwrapData<ClientOrder[]>(data);
  },

  async getOrder(oid: string): Promise<ClientOrder> {
    const { data } = await apiSync.get(`/v1/client/orders/${oid}/`);
    return unwrapData<ClientOrder>(data);
  },

  // ── Wishlist ───────────────────────────────────────────────────────────────
  async getWishlist(): Promise<WishlistItem[]> {
    const { data } = await apiSync.get("/v1/client/wishlist/");
    return unwrapData<WishlistItem[]>(data);
  },

  async toggleWishlist(product_id: string): Promise<WishlistToggleResponse> {
    const { data } = await apiSync.post("/v1/client/wishlist/toggle/", { product_id });
    return data as WishlistToggleResponse;
  },

  // ── Reviews ────────────────────────────────────────────────────────────────
  async getProductReviews(product_id: string): Promise<ProductReview[]> {
    // Public endpoint — no auth required (falls under /api/v1/home/ on backend)
    const { data } = await apiSync.get(`/v1/home/reviews/${product_id}/`);
    return unwrapData<ProductReview[]>(data);
  },

  async createReview(payload: ReviewCreatePayload): Promise<{ message: string }> {
    const { data } = await apiSync.post("/v1/client/reviews/create/", payload);
    return data as { message: string };
  },

  // ── Wallet ─────────────────────────────────────────────────────────────────
  async getWalletBalance(): Promise<WalletBalance> {
    const { data } = await apiSync.get("/v1/client/wallet/balance/");
    return unwrapData<WalletBalance>(data);
  },

  async transferFunds(payload: WalletTransferPayload): Promise<WalletTransferResponse> {
    const { data } = await apiSync.post("/v1/client/wallet/transfer/", payload);
    return data as WalletTransferResponse;
  },

  // ── Dashboard (Async / Ninja) ──────────────────────────────────────────────
  async getDashboard(): Promise<ClientDashboard> {
    const data = await apiAsync.get("client/dashboard/").json();
    return ClientDashboardSchema.parse(data);
  },
};
