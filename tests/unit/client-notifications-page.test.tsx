import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/client", () => ({
  ClientNotificationsView: () => (
    <div>
      <h1>Client Notifications Canonical View</h1>
      <p>Notification feed is exported from the client feature barrel.</p>
    </div>
  ),
}));

vi.mock("@/features/client/components/client-views", () => ({
  ClientNotificationsView: () => (
    <div>
      <h1>Legacy Monolithic Notifications View</h1>
    </div>
  ),
}));

describe("client notifications route", () => {
  it("renders the canonical client notifications export instead of a monolithic deep import", async () => {
    const module = await import("@/app/client/dashboard/notifications/page");
    const Page = module.default;

    render(<Page />);

    expect(
      screen.getByRole("heading", {
        name: /client notifications canonical view/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/legacy monolithic notifications view/i),
    ).not.toBeInTheDocument();
  });
});
