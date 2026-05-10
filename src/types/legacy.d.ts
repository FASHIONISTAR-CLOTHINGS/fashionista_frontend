/**
 * @file src/types/legacy.d.ts
 * @description Global ambient type declarations for legacy UI components that
 * predate the FSD feature-domain migration.
 *
 * These interfaces are intentionally kept as global declarations so that the
 * legacy compound components (Card, CartCard, VendorCard, Cads) and legacy
 * pages (vendors, admin-dashboard/orders) do not need import refactoring.
 *
 * Migration path: As each legacy component is refactored into its feature
 * domain, replace its usage of these globals with the typed imports from the
 * canonical domain types (e.g., `ProductListItem` from
 * `@/features/product/types/product.types`).
 *
 * DO NOT add new globals here — all new code must use explicit imports.
 */

/** Legacy product card shape used by `/components/ui/compounds/Card.tsx` */
interface CardProps {
  id: string | number;
  image: string;
  title: string;
  vendor: string;
  price: number | string;
  rating: number;
  slug?: string;
}

/**
 * Legacy vendor card shape used by:
 * - `/components/ui/compounds/VendorCard.tsx`
 * - `/core/services/api.ts`
 * - `/app/(home)/vendors/page.tsx`
 */
interface VendorProp {
  id: string;
  image: string;
  name: string;
  rating: number;
  address: string;
  mobile: string;
  slug: string;
}

/**
 * Legacy order row shape used by:
 * - `/app/admin-dashboard/orders/page.tsx`
 */
interface OrderProp {
  id: number | string;
  date: string;
  customer_name: string;
  address: string;
  payment_status: string;
  order_status: string;
  items: number;
}
