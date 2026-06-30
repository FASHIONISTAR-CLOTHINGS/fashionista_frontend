import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/vendor", () => ({
  VendorPayoutsView: () => (
    <div>
      <h1>Vendor Payouts Canonical View</h1>
      <p>Manage your bank accounts and request withdrawals.</p>
    </div>
  ),
}));

vi.mock("@/features/payment", () => ({
  PayoutDashboard: () => (
    <div>
      <h1>Legacy Payment Payout Dashboard</h1>
      <p>Recipient Code</p>
    </div>
  ),
}));

describe("vendor payouts route", () => {
  it("renders the canonical vendor payout surface instead of the legacy payment dashboard", async () => {
    const module = await import("@/app/vendor/payouts/page");
    const Page = module.default;

    render(<Page />);

    expect(
      screen.getByRole("heading", { name: /vendor payouts canonical view/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/manage your bank accounts and request withdrawals/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/legacy payment payout dashboard/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/recipient code/i)).not.toBeInTheDocument();
  });
});
