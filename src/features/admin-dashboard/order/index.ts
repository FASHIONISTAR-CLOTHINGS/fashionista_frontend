/**
 * features/order/admin-dashboard/index.ts
 * Public entry sub-barrel for order admin features.
 */

export * from "./types";
export * from "./api";
export * from "./hooks";
export { OrderList as AdminOrderList } from "./components/OrderList";
export { OrderDetailView as AdminOrderDetailView } from "./components/OrderDetailView";
export { default as OrderListDefault } from "./components/OrderList";
export { OrderDetailView as OrderDetailViewDefault } from "./components/OrderDetailView";
