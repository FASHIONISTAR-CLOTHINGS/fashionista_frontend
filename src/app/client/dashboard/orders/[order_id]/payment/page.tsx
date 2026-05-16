import { OrderPaymentView } from "@/features/order";

export default async function ClientOrderPaymentPage({
  params,
}: {
  params: Promise<{ order_id: string }>;
}) {
  const { order_id } = await params;
  return <OrderPaymentView orderId={order_id} />;
}
