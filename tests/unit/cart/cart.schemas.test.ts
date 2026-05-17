import { describe, expect, it } from "vitest";

import { CartSchema } from "@/features/cart/schemas/cart.schemas";

describe("CartSchema", () => {
  it("normalizes the live DRF cart payload into the canonical cart shape", () => {
    const rawCart = {
      id: "019e36e5-5192-77a3-9d25-c6403c600d05",
      subtotal: 210000.0,
      coupon_discount: 0.0,
      total: 210000.0,
      item_count: 1,
      coupon_code: null,
      last_activity: "2026-05-17T18:04:18.835584+01:00",
      items: [
        {
          id: "019e36e5-5527-72df-97de-978abeaae8f9",
          product: {
            id: "019e36e4-a942-7ec1-b929-38baf8d8eafd",
            title: "Vision Browser Product 1779037414521",
            slug: "vision-browser-product-1779037414521",
            sku: "FSN-9F70265C",
            image_url: null,
            requires_measurement: false,
            vendor_name: "QA Fashion Store",
          },
          variant: null,
          quantity: 1,
          unit_price: "15000.00",
          line_total: 15000.0,
        },
      ],
    };

    const parsed = CartSchema.parse(rawCart);

    expect(parsed.currency).toBe("NGN");
    expect(parsed.expires_at).toBe("2026-05-17T18:04:18.835584+01:00");
    expect(parsed.applied_coupon).toBeNull();
    expect(parsed.subtotal).toBe("210000");
    expect(parsed.items[0]).toMatchObject({
      id: "019e36e5-5527-72df-97de-978abeaae8f9",
      variant_id: null,
      size_label: null,
      color_label: null,
      unit_price: "15000.00",
      line_total: "15000",
      currency: "NGN",
    });
    expect(parsed.items[0].product).toEqual({
      id: "019e36e4-a942-7ec1-b929-38baf8d8eafd",
      title: "Vision Browser Product 1779037414521",
      slug: "vision-browser-product-1779037414521",
      sku: "FSN-9F70265C",
      cover_image_url: null,
      requires_measurement: false,
      vendor_name: "QA Fashion Store",
    });
  });
});
