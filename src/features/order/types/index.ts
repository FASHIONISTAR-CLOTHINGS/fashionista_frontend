/**
 * entities/order/types/index.ts
 * Order entity types — mirrors Django Order + OrderTimeline + OrderDispute.
 * Includes 2026+ fields: tracking_number, courier_service, estimated_delivery_at,
 * is_gift, gift_message, carbon_offset_purchased.
 */

export type OrderStatus =
  | "pending" | "confirmed" | "processing" | "ready_for_pickup"
  | "shipped" | "delivered" | "cancelled" | "refunded" | "disputed";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "partial";

export type DeliveryMethod = "standard" | "express" | "pickup" | "same_day";

export interface OrderTimelineEntry {
  id: string;
  status: OrderStatus;
  note: string;
  actorId: string | null;
  actorName: string | null;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productTitle: string;
  productSlug: string;
  productImageUrl: string | null;
  variantDetails: string;
  quantity: number;
  unitPriceNgn: string;
  totalPriceNgn: string;
  requiresMeasurement: boolean;
  hasSubmittedMeasurements: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryMethod: DeliveryMethod;
  // 2026+ tracking fields
  trackingNumber: string | null;
  courierService: string | null;
  estimatedDeliveryAt: string | null;
  isGift: boolean;
  giftMessage: string | null;
  carbonOffsetPurchased: boolean;
  // Financials
  subtotalNgn: string;
  discountNgn: string;
  shippingNgn: string;
  taxNgn: string;
  totalNgn: string;
  currency: string;
  // Addresses
  shippingAddress: string;
  billingAddress: string;
  // Relations
  vendorStoreName: string;
  items: OrderItem[];
  timeline: OrderTimelineEntry[];
  // Timestamps
  createdAt: string;
  updatedAt: string;
  confirmedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
}

export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalNgn: string;
  itemCount: number;
  primaryImageUrl: string | null;
  vendorStoreName: string;
  createdAt: string;
  estimatedDeliveryAt: string | null;
  trackingNumber: string | null;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  ready_for_pickup: "Ready for Pickup",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
  disputed: "Disputed",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  confirmed: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  processing: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  ready_for_pickup: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  shipped: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  delivered: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
  refunded: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  disputed: "bg-rose-500/20 text-rose-300 border-rose-500/30",
};

export interface OrderDetail {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryMethod: DeliveryMethod;
  // 2026+ tracking fields
  trackingNumber: string | null;
  courierService: string | null;
  estimatedDeliveryAt: string | null;
  isGift: boolean;
  giftMessage: string | null;
  carbonOffsetPurchased: boolean;
  // Financials
  subtotalNgn: string;
  discountNgn: string;
  shippingNgn: string;
  taxNgn: string;
  totalNgn: string;
  currency: string;
  // Addresses
  shippingAddress: string;
  billingAddress: string;
  // Relations
  vendorStoreName: string;
  items: OrderItem[];
  timeline: OrderTimelineEntry[];
  // Timestamps
  createdAt: string;
  updatedAt: string;
  confirmedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
}


export interface OrderList {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryMethod: DeliveryMethod;
  // 2026+ tracking fields
  trackingNumber: string | null;
  courierService: string | null;
  estimatedDeliveryAt: string | null;
  isGift: boolean;
  giftMessage: string | null;
  carbonOffsetPurchased: boolean;
  // Financials
  subtotalNgn: string;
  discountNgn: string;
  shippingNgn: string;
  taxNgn: string;
  totalNgn: string;
  currency: string;
  // Addresses
  shippingAddress: string;
  billingAddress: string;
  // Relations
  vendorStoreName: string;
  items: OrderItem[];
  timeline: OrderTimelineEntry[];
  // Timestamps
  createdAt: string;
  updatedAt: string;
  confirmedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
}

export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryMethod: DeliveryMethod;
  // 2026+ tracking fields
  trackingNumber: string | null;
  courierService: string | null;
  estimatedDeliveryAt: string | null;
  isGift: boolean;
  giftMessage: string | null;
  carbonOffsetPurchased: boolean;
  // Financials
  subtotalNgn: string;
  discountNgn: string;
  shippingNgn: string;
  taxNgn: string;
  totalNgn: string;
  currency: string;
  // Addresses
  shippingAddress: string;
  billingAddress: string;
  // Relations
  vendorStoreName: string;
  items: OrderItem[];
  timeline: OrderTimelineEntry[];
  // Timestamps
  createdAt: string;
  updatedAt: string;
  confirmedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
}
