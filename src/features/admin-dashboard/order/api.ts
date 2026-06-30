/**
 * @file api.ts
 * @description Isolated administrative API client for the Order domain.
 */
import { apiAdminAsync, apiAdminSync } from "@/core/api/client.admin";
import { unwrapApiData } from "@/core/api/response";
import { parseOrderResponse, PaginatedOrderListSchema, OrderDetailSchema } from "@/features/order/schemas/order.schemas";
import type { PaginatedOrderList, OrderDetail, AdminDeliveryStatusInput } from "@/features/order/types/order.types";

interface NinjaListEnvelope {
  count?: number;
  data?: unknown[];
  results?: unknown[];
  next?: string | null;
  previous?: string | null;
}

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

/** Fetch all orders (admin). */
export async function fetchAdminOrders(
  page = 1,
  search?: string,
  status?: string
): Promise<PaginatedOrderList> {
  const searchParams: Record<string, any> = { page, limit: 100 };
  if (search) searchParams.search = search;
  if (status) searchParams.status = status;

  const data = await apiAdminAsync.get("order/", {
    searchParams,
  }).json();
  
  return parseOrderResponse(
    PaginatedOrderListSchema,
    normalizeNinjaOrderList(data),
    "fetchAdminOrders"
  ) as PaginatedOrderList;
}

/** Fetch single order detail for admin/staff review. */
export async function fetchAdminOrderDetail(orderId: string): Promise<OrderDetail> {
  const data = await apiAdminAsync.get(`order/${orderId}/`).json();
  return parseOrderResponse(
    OrderDetailSchema,
    unwrapApiData(data),
    "fetchAdminOrderDetail"
  ) as OrderDetail;
}

/** Update delivery status (admin). */
export async function updateAdminDeliveryStatus(
  orderId: string,
  input: AdminDeliveryStatusInput
): Promise<OrderDetail> {
  const { data } = await apiAdminSync.patch<unknown>(
    `order/${orderId}/transition/`,
    { new_status: input.status }
  );
  return parseOrderResponse(
    OrderDetailSchema,
    unwrapApiData(data),
    "updateAdminDeliveryStatus"
  ) as OrderDetail;
}

/** Transition order status (admin). */
export async function transitionAdminOrderStatus(
  orderId: string,
  newStatus: string,
  note = ""
): Promise<OrderDetail> {
  const { data } = await apiAdminSync.post<unknown>(
    `order/${orderId}/transition/`,
    { new_status: newStatus, note }
  );
  return parseOrderResponse(
    OrderDetailSchema,
    unwrapApiData(data),
    "transitionAdminOrderStatus"
  ) as OrderDetail;
}

/** Release escrow to vendor (admin). */
export async function releaseAdminOrderEscrow(orderId: string): Promise<OrderDetail> {
  const { data } = await apiAdminSync.post<unknown>(
    `order/${orderId}/release-escrow/`,
    {}
  );
  return parseOrderResponse(
    OrderDetailSchema,
    unwrapApiData(data),
    "releaseAdminOrderEscrow"
  ) as OrderDetail;
}

/** Cancel order as administrator. */
export async function cancelAdminOrder(
  orderId: string,
  reason = "Cancelled by administrator."
): Promise<OrderDetail> {
  const { data } = await apiAdminSync.post<unknown>(
    `order/${orderId}/cancel/`,
    { reason }
  );
  return parseOrderResponse(
    OrderDetailSchema,
    unwrapApiData(data),
    "cancelAdminOrder"
  ) as OrderDetail;
}
