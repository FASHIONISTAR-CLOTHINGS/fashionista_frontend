import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/features/vendor", () => ({
  VendorOrdersView: () => <div>Vendor Orders View</div>,
}));

vi.mock("@/features/order", () => ({
  OrderTable: () => <div>Legacy Order Table</div>,
}));

import VendorOrdersPage from "@/app/vendor/orders/page";

describe("VendorOrdersPage", () => {
  it("renders the canonical vendor orders surface", () => {
    render(<VendorOrdersPage />);

    expect(screen.getByText("Vendor Orders View")).toBeInTheDocument();
    expect(screen.queryByText("Legacy Order Table")).not.toBeInTheDocument();
  });
});
