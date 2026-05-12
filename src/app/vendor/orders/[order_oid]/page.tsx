import { OrderDetailView } from "@/features/order";

export default async function VendorOrderDetailPage({
  params,
}: {
  params: Promise<{ order_oid: string }>;
}) {
  const { order_oid } = await params;
  return <OrderDetailView orderId={order_oid} backHref="/vendor/orders" scope="vendor" />;
}
