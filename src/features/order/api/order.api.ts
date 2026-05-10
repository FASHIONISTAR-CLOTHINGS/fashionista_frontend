/**
 * @file order.api.ts
 * @description Order domain API client — Fashionistar frontend.
 *
 * Endpoint Routing:
 *  - DRF sync  → /v1/orders/ (mutations: cancel, confirm-delivery, status updates)
 *  - Ninja async → /orders/ through apiAsync prefix /api/v1/ninja
 */
import { apiAsync } from "@/core/api/client.async";
import { apiSync } from "@/core/api/client.sync";
import { unwrapApiData } from "@/core/api/response";
import {
  parseOrderResponse,
  PaginatedOrderListSchema,
  OrderDetailSchema,
} from "../schemas/order.schemas";
import type {
  PaginatedOrderList,
  OrderDetail,
  CancelOrderInput,
  VendorProductionStatusInput,
  AdminDeliveryStatusInput,
} from "../types/order.types";

// Status count types — returned by Ninja /counts/ endpoints
export type OrderStatusCounts = Record<string, number>;

// Vendor financial summary — returned by Ninja /vendor/financial-summary/
export interface VendorOrderFinancialSummary {
  total_revenue: number;
  total_commission: number;
  total_payout: number;
  order_count: number;
}

const BASE = "/orders";

type NinjaListEnvelope = {
  count?: number;
  data?: unknown[];
  results?: unknown[];
  next?: string | null;
  previous?: string | null;
};

function normalizeNinjaOrderList(payload: unknown): PaginatedOrderList {
  const unwrapped = unwrapApiData<NinjaListEnvelope | unknown[]>(payload);
  if (Array.isArray(unwrapped)) {
    return {
      count: unwrapped.length,
      next: null,
      previous: null,
      results: unwrapped as PaginatedOrderList["results"],
    };
  }
  const rows = Array.isArray(unwrapped?.data)
    ? unwrapped.data
    : Array.isArray(unwrapped?.results)
      ? unwrapped.results
      : [];
  return {
    count: unwrapped?.count ?? rows.length,
    next: unwrapped?.next ?? null,
    previous: unwrapped?.previous ?? null,
    results: rows as PaginatedOrderList["results"],
  };
}

// ── CLIENT ────────────────────────────────────────────────────────────────────

/** Fetch paginated order list (client — own orders only). */
export async function fetchClientOrders(page = 1): Promise<PaginatedOrderList> {
  const data = await apiAsync.get("orders/", {
    searchParams: { page, limit: 50 },
  }).json();
  return parseOrderResponse(
    PaginatedOrderListSchema,
    normalizeNinjaOrderList(data),
    "fetchClientOrders",
  ) as PaginatedOrderList;
}

/** Fetch single order detail (client — owner only). */
export async function fetchOrderDetail(orderId: string): Promise<OrderDetail> {
  const data = await apiAsync.get(`orders/${orderId}/`).json();
  return parseOrderResponse(
    OrderDetailSchema,
    unwrapApiData(data),
    "fetchOrderDetail",
  ) as OrderDetail;
}

/** Fetch single order detail for the authenticated vendor. */
export async function fetchVendorOrderDetail(orderId: string): Promise<OrderDetail> {
  const data = await apiAsync.get(`orders/vendor/${orderId}/`).json();
  return parseOrderResponse(
    OrderDetailSchema,
    unwrapApiData(data),
    "fetchVendorOrderDetail",
  ) as OrderDetail;
}

/** Fetch single order detail for admin/staff review. */
export async function fetchAdminOrderDetail(orderId: string): Promise<OrderDetail> {
  const data = await apiAsync.get(`orders/admin/${orderId}/`).json();
  return parseOrderResponse(
    OrderDetailSchema,
    unwrapApiData(data),
    "fetchAdminOrderDetail",
  ) as OrderDetail;
}

/** Cancel an order (client — owner, allowed statuses only). */
export async function cancelOrder(
  orderId: string,
  input: CancelOrderInput,
): Promise<OrderDetail> {
  const { data } = await apiSync.post<unknown>(`${BASE}/${orderId}/cancel/`, input);
  return parseOrderResponse(
    OrderDetailSchema,
    unwrapApiData(data),
    "cancelOrder",
  ) as OrderDetail;
}

/** Confirm delivery and trigger escrow release (client — owner). */
export async function confirmDelivery(orderId: string): Promise<OrderDetail> {
  const { data } = await apiSync.post<unknown>(
    `${BASE}/${orderId}/confirm-delivery/`,
  );
  return parseOrderResponse(
    OrderDetailSchema,
    unwrapApiData(data),
    "confirmDelivery",
  ) as OrderDetail;
}

// ── VENDOR ────────────────────────────────────────────────────────────────────

/** Fetch vendor's order list. */
export async function fetchVendorOrders(page = 1): Promise<PaginatedOrderList> {
  const data = await apiAsync.get("orders/vendor/", {
    searchParams: { page, limit: 50 },
  }).json();
  return parseOrderResponse(
    PaginatedOrderListSchema,
    normalizeNinjaOrderList(data),
    "fetchVendorOrders",
  ) as PaginatedOrderList;
}

/** Update production/shipping status (vendor). */
export async function updateVendorProductionStatus(
  orderId: string,
  input: VendorProductionStatusInput,
): Promise<OrderDetail> {
  const { data } = await apiSync.patch<unknown>(
    `${BASE}/vendor/${orderId}/production-status/`,
    input,
  );
  return parseOrderResponse(
    OrderDetailSchema,
    unwrapApiData(data),
    "updateVendorProductionStatus",
  ) as OrderDetail;
}

// ── ADMIN ─────────────────────────────────────────────────────────────────────

/** Fetch all orders (admin). */
export async function fetchAdminOrders(page = 1): Promise<PaginatedOrderList> {
  const data = await apiAsync.get("orders/admin/", {
    searchParams: { page, limit: 100 },
  }).json();
  return parseOrderResponse(
    PaginatedOrderListSchema,
    normalizeNinjaOrderList(data),
    "fetchAdminOrders",
  ) as PaginatedOrderList;
}

/** Update delivery status (admin). */
export async function updateAdminDeliveryStatus(
  orderId: string,
  input: AdminDeliveryStatusInput,
): Promise<OrderDetail> {
  const { data } = await apiSync.patch<unknown>(
    `${BASE}/admin/${orderId}/delivery-status/`,
    input,
  );
  return parseOrderResponse(
    OrderDetailSchema,
    unwrapApiData(data),
    "updateAdminDeliveryStatus",
  ) as OrderDetail;
}

// ── Ninja Async Reads (status counts + financials) ───────────────────────────

/**
 * GET /api/v1/ninja/orders/counts/
 * Returns per-status order counts for the authenticated client.
 * Single GROUP BY query — sub-ms latency.
 */
export async function getNinjaClientOrderCounts(): Promise<OrderStatusCounts> {
  const envelope = await apiAsync
    .get("orders/counts/")
    .json<{ status: string; data: OrderStatusCounts }>();
  return (envelope?.data ?? {}) as OrderStatusCounts;
}

/**
 * GET /api/v1/ninja/orders/vendor/counts/
 * Returns per-status order counts for the authenticated vendor.
 * Single GROUP BY query — used for badge rendering on the vendor dashboard.
 */
export async function getNinjaVendorOrderCounts(): Promise<OrderStatusCounts> {
  const envelope = await apiAsync
    .get("orders/vendor/counts/")
    .json<{ status: string; data: OrderStatusCounts }>();
  return (envelope?.data ?? {}) as OrderStatusCounts;
}

/**
 * GET /api/v1/ninja/orders/vendor/financial-summary/
 * Returns: total_revenue, total_commission, total_payout, order_count.
 * Single aaggregate() DB call — used for vendor financial dashboard widget.
 */
export async function getNinjaVendorFinancialSummary(): Promise<VendorOrderFinancialSummary> {
  const envelope = await apiAsync
    .get("orders/vendor/financial-summary/")
    .json<{ status: string; data: VendorOrderFinancialSummary }>();
  return (envelope?.data ?? {
    total_revenue: 0,
    total_commission: 0,
    total_payout: 0,
    order_count: 0,
  }) as VendorOrderFinancialSummary;
}
