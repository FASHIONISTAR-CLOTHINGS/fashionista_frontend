import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/client", () => ({
  ClientWalletView: () => (
    <div>
      <h1>Client Wallet Canonical View</h1>
      <p>Manage your client-owned wallet workspace.</p>
    </div>
  ),
}));

vi.mock("@/features/wallet", () => ({
  WalletDashboardView: () => (
    <div>
      <h1>Legacy Generic Wallet Dashboard</h1>
    </div>
  ),
}));

describe("client wallet route", () => {
  it("renders the canonical client wallet surface instead of the generic wallet feature", async () => {
    const module = await import("@/app/client/dashboard/wallet/page");
    const Page = module.default;

    render(<Page />);

    expect(
      screen.getByRole("heading", { name: /client wallet canonical view/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/legacy generic wallet dashboard/i),
    ).not.toBeInTheDocument();
  });
});
