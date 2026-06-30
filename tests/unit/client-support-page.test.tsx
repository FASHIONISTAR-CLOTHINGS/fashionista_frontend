import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/client", () => ({
  ClientSupportView: () => (
    <div>
      <h1>Client Support Canonical View</h1>
      <p>Support tickets live behind the client feature barrel.</p>
    </div>
  ),
}));

vi.mock("@/features/client/components/client-views", () => ({
  ClientSupportView: () => (
    <div>
      <h1>Legacy Monolithic Support View</h1>
    </div>
  ),
}));

describe("client support route", () => {
  it("renders the canonical client support export instead of a monolithic deep import", async () => {
    const module = await import("@/app/client/dashboard/support/page");
    const Page = module.default;

    render(<Page />);

    expect(
      screen.getByRole("heading", { name: /client support canonical view/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/legacy monolithic support view/i),
    ).not.toBeInTheDocument();
  });
});
