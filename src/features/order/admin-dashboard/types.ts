/**
 * @file types.ts
 * @description Admin Dashboard specific types for the Order domain.
 */

import type { OrderDetail, OrderListItem, PaginatedOrderList } from "../types/order.types";

export type AdminOrderDetail = OrderDetail;
export type AdminOrderListItem = OrderListItem;
export type PaginatedAdminOrderList = PaginatedOrderList;

export interface AdminTransitionStatusInput {
  orderId: string;
  newStatus: string;
  note?: string;
}

export interface AdminCancelOrderInput {
  orderId: string;
  reason?: string;
}
