import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/auth/components/RoleGuard", () => ({
  RoleGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/features/client", () => ({
  ClientWishlistView: () => (
    <div>
      <h1>Client Wishlist Canonical View</h1>
      <p>Saved products live in one shared wishlist workspace.</p>
    </div>
  ),
}));

vi.mock("@/features/client/components/client-wishlist-view", () => ({
  ClientWishlistView: () => (
    <div>
      <h1>Legacy Deep Import Wishlist View</h1>
    </div>
  ),
}));

describe("client wishlist route", () => {
  it("renders the canonical client wishlist export instead of a deep-import page dependency", async () => {
    const module = await import("@/app/client/dashboard/wishlist/page");
    const Page = module.default;

    render(<Page />);

    expect(
      screen.getByRole("heading", { name: /client wishlist canonical view/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/legacy deep import wishlist view/i),
    ).not.toBeInTheDocument();
  });
});
