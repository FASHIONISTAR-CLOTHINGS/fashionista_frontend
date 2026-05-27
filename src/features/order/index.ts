/**
 * @file index.ts
 * @description Public API for the `features/order` canonical FSD slice.
 *
 * Dual-Engine Strategy:
 *  - DRF (sync): All mutations (cancel, confirm-delivery, status updates)
 *  - Ninja (async): All reads — lists, detail, status counts, vendor financials
 */

// ── Types ──────────────────────────────────────────────────────────────────
export type {
  OrderDetail,
  OrderListItem,
  OrderItemSnapshot,
  OrderStatus,
  EscrowStatus,
  PaymentStatus,
  OrderStatusHistory,
  OrderDeliveryTracking,
  OrderRefundRequest,
  PaginatedOrderList,
  CancelOrderInput,
  VendorProductionStatusInput,
  AdminDeliveryStatusInput,
} from "./types/order.types";

// ── API Types (Ninja-specific) ─────────────────────────────────────────────
export type { OrderStatusCounts, VendorOrderFinancialSummary } from "./api/order.api";

// ── Schemas ────────────────────────────────────────────────────────────────
export {
  OrderListItemSchema,
  OrderDetailSchema,
  PaginatedOrderListSchema,
} from "./schemas/order.schemas";

// ── API ────────────────────────────────────────────────────────────────────
export {
  fetchClientOrders,
  fetchOrderDetail,
  fetchVendorOrderDetail,
  cancelOrder,
  confirmDelivery,
  fetchVendorOrders,
  updateVendorProductionStatus,
  // Ninja async endpoints
  getNinjaClientOrderCounts,
  getNinjaVendorOrderCounts,
  getNinjaVendorFinancialSummary,
} from "./api/order.api";


// ── TanStack Query Hooks ───────────────────────────────────────────────────
export {
  orderKeys,
  // List & detail
  useClientOrders,
  useOrderDetail,
  useVendorOrderDetail,
  // DRF mutations
  useCancelOrder,
  useConfirmDelivery,
  useVendorOrders,
  useUpdateVendorProductionStatus,
  // Ninja async reads
  useNinjaClientOrderCounts,
  useNinjaVendorOrderCounts,
  useNinjaVendorFinancialSummary,
} from "./hooks/use-order";


// ── Server Actions ─────────────────────────────────────────────────────────
export {
  getClientOrdersAction,
  getOrderDetailAction,
  trackOrderAction,
} from "./api/order.server-actions";

export { OrderTable, ClientOrderList, OrderDetailView, OrderPaymentView, OrderConfirmationView } from "./components";

// Admin exports have been moved to the centralized admin-dashboard feature slice.
