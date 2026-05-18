// Prevent EmptyGenerateStaticParamsError with cacheComponents: true
export const dynamic = 'force-dynamic';

import { OrderDetailView } from "@/features/order";

export default async function VendorOrderDetailPage({
  params,
}: {
  params: Promise<{ order_id: string }>;
}) {
  const { order_id } = await params;
  return <OrderDetailView orderId={order_id} backHref="/vendor/orders" scope="vendor" />;
}
