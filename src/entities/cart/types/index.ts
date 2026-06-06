// src/entities/cart/types/index.ts
/**
 * Cart entity types — single source of truth for all cart-related shapes.
 * Mirrors apps/cart/models/cart.py CartItem schema.
 */

export interface CartItem {
  id: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  productSku: string;
  productImage: string | null;
  variantId: string | null;
  variantDescription: string | null;
  sizeSnapshot: string;
  colorSnapshot: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  requiresMeasurement: boolean;
  measurementProfileId: string | null;
  isCustomOrder: boolean;
  idempotencyKey: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  currency: string;
  promoCode: string | null;
  discountAmount: number;
  estimatedTotal: number;
  hasMeasurementGate: boolean;
  hasMissingMeasurements: boolean;
  updatedAt: string;
}

export interface AddToCartPayload {
  productId: string;
  variantId?: string | null;
  quantity: number;
  measurementProfileId?: string | null;
  customizationNotes?: string;
  idempotencyKey: string;
}

export interface UpdateCartItemPayload {
  itemId: string;
  quantity: number;
}
