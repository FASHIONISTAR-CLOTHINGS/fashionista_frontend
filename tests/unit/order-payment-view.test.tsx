import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import OrderPaymentView from "@/features/order/components/OrderPaymentView";
import OrderDetailView from "@/features/order/components/OrderDetailView";

const mockPush = vi.fn();
const mockRefresh = vi.fn();

const baseOrder = {
  id: "order-1",
  order_number: "FSN-ORD-TEST-001",
  status: "pending_payment",
  payment_status: "unpaid",
  escrow_status: "held",
  amount_paid_total: "500.00",
  percent_paid_total: "50.00",
  amount_outstanding: "500.00",
  is_fully_paid: false,
  cash_payment_mode_snapshot: "both",
  delivery_mode: "cod",
  item_count: 1,
  subtotal: "1000.00",
  final_total: "1000.00",
  currency: "NGN",
  requires_measurement: false,
  created_at: "2026-05-16T12:00:00.000Z",
  buyer_name: "",
  buyer_email: "",
  buyer_phone: null,
  buyer_address: {},
  items: [],
  status_history: [],
  delivery_tracking: null,
  refund_request: null,
  notes: "",
  idempotency_key: "idem-1",
  paid_at: null,
  first_paid_at: "2026-05-16T12:00:00.000Z",
  final_paid_at: null,
  active_payment_path: "cod",
  delivered_at: null,
  cancelled_at: null,
  payment_records: [
    {
      sequence_number: 1,
      payment_source: "gateway",
      provider: "paystack",
      selected_percent: 50,
      applied_percent: "50.00",
      amount: "500.00",
      currency: "NGN",
      cumulative_amount_paid: "500.00",
      cumulative_percent_paid: "50.00",
      remaining_amount: "500.00",
      remaining_percent: "50.00",
      is_final_payment: false,
      paid_at: "2026-05-16T12:00:00.000Z",
      correlation_id: "corr-1",
      metadata: {},
    },
    {
      sequence_number: 2,
      payment_source: "gateway",
      provider: "paystack",
      selected_percent: 30,
      applied_percent: "30.00",
      amount: "300.00",
      currency: "NGN",
      cumulative_amount_paid: "800.00",
      cumulative_percent_paid: "80.00",
      remaining_amount: "200.00",
      remaining_percent: "20.00",
      is_final_payment: false,
      paid_at: "2026-05-17T12:00:00.000Z",
      correlation_id: "corr-2",
      metadata: {},
    },
    {
      sequence_number: 3,
      payment_source: "manual_adjustment",
      provider: "cod",
      selected_percent: 20,
      applied_percent: "20.00",
      amount: "200.00",
      currency: "NGN",
      cumulative_amount_paid: "1000.00",
      cumulative_percent_paid: "100.00",
      remaining_amount: "0.00",
      remaining_percent: "0.00",
      is_final_payment: true,
      paid_at: "2026-05-18T12:00:00.000Z",
      correlation_id: "corr-3",
      metadata: {},
    },
  ],
  commercial_transition_logs: [],
  updated_at: "2026-05-18T12:00:00.000Z",
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

vi.mock("@/features/order/hooks/use-order", () => ({
  useOrderDetail: vi.fn(() => ({
    data: baseOrder,
    isLoading: false,
    isError: false,
  })),
  useVendorOrderDetail: vi.fn(() => ({
    data: baseOrder,
    isLoading: false,
    isError: false,
  })),
  useAdminOrderDetail: vi.fn(() => ({
    data: baseOrder,
    isLoading: false,
    isError: false,
  })),
  useCancelOrder: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useConfirmDelivery: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useVerifyPickup: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

vi.mock("@/features/payment", () => ({
  useFundWalletPayment: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
}));

describe("Order payment surfaces", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockRefresh.mockReset();
  });

  it("shows both COD and Pay at Shop options when cash mode is both", () => {
    render(<OrderPaymentView orderId="order-1" />);

    expect(screen.getByText("Cash on Delivery")).toBeInTheDocument();
    expect(screen.getByText("Pay at Shop")).toBeInTheDocument();
  });

  it("renders staged payment timeline entries for 50 -> 30 -> 20 flow", () => {
    render(<OrderPaymentView orderId="order-1" />);

    expect(screen.getByText("Payment #1 — 50%")).toBeInTheDocument();
    expect(screen.getByText("Payment #2 — 30%")).toBeInTheDocument();
    expect(screen.getByText("Payment #3 — 20%")).toBeInTheDocument();
  });

  it("shows continue payment link for partially paid order detail", () => {
    render(
      <OrderDetailView
        orderId="order-1"
        backHref="/client/dashboard/orders"
        scope="client"
      />,
    );

    const continueLink = screen.getByRole("link", { name: /continue payment/i });
    expect(continueLink).toHaveAttribute(
      "href",
      "/client/dashboard/orders/order-1/payment",
    );
  });
});
