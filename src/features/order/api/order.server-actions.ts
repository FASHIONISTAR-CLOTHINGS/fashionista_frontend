/**
 * @file order.server-actions.ts
 * @description Next.js Server Actions for the Order domain.
 * Uses canonical order API clients, proper error handling, and typed returns.
 */
"use server";

import { fetchClientOrders, fetchOrderDetail } from "./order.api";
import type { PaginatedOrderList, OrderDetail } from "../types/order.types";

/**
 * Server Action: fetch authenticated user's order list.
 * Used in RSC or form actions where TanStack Query is unavailable.
 */
export async function getClientOrdersAction(
  page = 1,
): Promise<PaginatedOrderList | null> {
  try {
    return await fetchClientOrders(page);
  } catch (error) {
    console.error("[getClientOrdersAction]", error);
    return null;
  }
}

/**
 * Server Action: fetch single order detail.
 */
export async function getOrderDetailAction(
  orderId: string,
): Promise<OrderDetail | null> {
  try {
    return await fetchOrderDetail(orderId);
  } catch (error) {
    console.error("[getOrderDetailAction]", orderId, error);
    return null;
  }
}

/**
 * Server Action: track order by order ID (from public tracking form).
 * Note: tracking form uses FormData — compatible with React 19 `action` prop.
 */
export async function trackOrderAction(
  formData: FormData,
): Promise<OrderDetail | null> {
  const orderId = String(formData.get("order_id") ?? "").trim();
  if (!orderId) return null;

  try {
    return await fetchOrderDetail(orderId);
  } catch (error) {
    console.error("[trackOrderAction]", orderId, error);
    return null;
  }
}
