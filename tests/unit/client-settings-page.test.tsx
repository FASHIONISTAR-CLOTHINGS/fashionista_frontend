import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/auth/components/RoleGuard", () => ({
  RoleGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/features/client", () => ({
  ClientSettingsView: () => (
    <div>
      <h1>Client Settings Canonical View</h1>
      <p>Manage your live profile and preferences.</p>
    </div>
  ),
}));

vi.mock("@/features/client/components/client-settings-view", () => ({
  ClientSettingsView: () => (
    <div>
      <h1>Legacy Deep Import Settings View</h1>
    </div>
  ),
}));

describe("client settings route", () => {
  it("renders the canonical client feature export instead of a deep-import page dependency", async () => {
    const module = await import("@/app/client/dashboard/settings/page");
    const Page = module.default;

    render(<Page />);

    expect(
      screen.getByRole("heading", { name: /client settings canonical view/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/legacy deep import settings view/i),
    ).not.toBeInTheDocument();
  });
});
