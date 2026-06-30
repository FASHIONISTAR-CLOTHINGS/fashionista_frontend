import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/client", () => ({
  ClientKycView: () => (
    <div>
      <h1>Client Kyc Canonical View</h1>
      <p>Complete your client verification workflow here.</p>
    </div>
  ),
}));

vi.mock("@/features/kyc", () => ({
  KycStatusView: () => (
    <div>
      <h1>Legacy Generic Kyc Status</h1>
    </div>
  ),
}));

describe("client kyc route", () => {
  it("renders the canonical client kyc surface instead of the generic kyc feature", async () => {
    const module = await import("@/app/client/dashboard/kyc/page");
    const Page = module.default;

    render(<Page />);

    expect(
      screen.getByRole("heading", { name: /client kyc canonical view/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/legacy generic kyc status/i),
    ).not.toBeInTheDocument();
  });
});
