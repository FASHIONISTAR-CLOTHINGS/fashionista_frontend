import type { Metadata } from "next";
import { OrderPaymentView } from "@/features/order";

type PageProps = { params: Promise<{ order_id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { order_id } = await params;
  return {
    title: `Complete Payment | Order #${order_id.slice(0, 8).toUpperCase()} | Fashionistar`,
    description:
      "Securely complete your payment for your Fashionistar order. Choose wallet, card, cash-on-delivery, or pay-at-shop.",
    robots: { index: false, follow: false },
  };
}

export default async function ClientOrderPaymentPage({ params }: PageProps) {
  const { order_id } = await params;
  return <OrderPaymentView orderId={order_id} />;
}
