import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderConfirmationView } from "@/features/order";

type PageProps = { params: Promise<{ order_id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { order_id } = await params;
  return {
    title: `Order Confirmed | #${order_id.slice(0, 8).toUpperCase()} | Fashionistar`,
    description:
      "Your Fashionistar order has been confirmed. Track tailoring progress, view payment details, and manage delivery.",
    robots: { index: false, follow: false },
  };
}

export default async function ClientOrderConfirmationPage({ params }: PageProps) {
  const { order_id } = await params;
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6 animate-pulse p-8">
          <div className="h-48 rounded-[2rem] bg-[hsl(var(--muted))]" />
          <div className="h-32 rounded-[2rem] bg-[hsl(var(--muted))]" />
          <div className="h-24 rounded-[2rem] bg-[hsl(var(--muted))]" />
        </div>
      }
    >
      <OrderConfirmationView orderId={order_id} />
    </Suspense>
  );
}
