/**
 * features/order/admin-dashboard/index.ts
 * Public entry sub-barrel for order admin features.
 */

export * from "./types";
export * from "./api";
export * from "./hooks";
export { OrderList } from "./components/OrderList";
export { OrderDetailView } from "./components/OrderDetailView";
export { default as OrderListDefault } from "./components/OrderList";
export { OrderDetailView as OrderDetailViewDefault } from "./components/OrderDetailView";
