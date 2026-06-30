import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

type SeededAuthSession = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    role: string;
    is_staff: boolean;
    first_name: string;
    last_name: string;
    is_verified: boolean;
  };
};

type PaymentRecord = {
  sequence_number: number;
  selected_percent: number;
};

type OrderDetail = {
  id: string;
  status: string;
  cash_payment_mode_snapshot?: "disabled" | "cod" | "pay_at_shop" | "both";
  amount_outstanding?: string;
  payment_records?: PaymentRecord[];
};

const seededAuthPath = path.resolve(
  process.cwd(),
  "tests/e2e/.tmp/seeded-auth.json",
);

function readSeededClient(): SeededAuthSession {
  const content = fs.readFileSync(seededAuthPath, "utf8");
  const sessions = JSON.parse(content) as Record<string, SeededAuthSession>;
  return sessions.client;
}

async function seedAuthenticatedSession(
  page: Page,
  session: SeededAuthSession,
) {
  await page.addInitScript((payload: SeededAuthSession) => {
    window.sessionStorage.setItem(
      "fashionistar-auth",
      JSON.stringify({
        state: {
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
          user: payload.user,
          isAuthenticated: true,
        },
      }),
    );
  }, session);
}

async function fetchPayableOrder(
  session: SeededAuthSession,
): Promise<OrderDetail | null> {
  const backendBaseUrl =
    process.env.PLAYWRIGHT_BACKEND_BASE_URL ?? "http://127.0.0.1:8001";
  const response = await fetch(`${backendBaseUrl}/api/v1/ninja/orders/`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Could not load seeded client orders: ${response.status}`);
  }

  const payload = (await response.json()) as {
    data?: OrderDetail[];
    results?: OrderDetail[];
  };
  const rows = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.results)
      ? payload.results
      : [];

  return (
    rows.find((order) => {
      const outstanding = Number(order.amount_outstanding ?? "0");
      return order.status === "pending_payment" || outstanding > 0;
    }) ?? null
  );
}

test.describe("Order payment route", () => {
  test("renders payment controls for a seeded payable client order", async ({
    page,
  }) => {
    const session = readSeededClient();
    const payableOrder = await fetchPayableOrder(session);

    test.skip(!payableOrder, "Seeded client has no payable order to verify.");

    await seedAuthenticatedSession(page, session);
    await page.goto(`/client/dashboard/orders/${payableOrder!.id}/payment`);

    await expect(page).toHaveURL(
      new RegExp(`/client/dashboard/orders/${payableOrder!.id}/payment`),
      { timeout: 30_000 },
    );
    await expect(
      page.getByRole("heading", { name: /order payment/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: /choose payment amount/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: /^payment method$/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /fashionistar wallet/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /card\s*\/\s*bank gateway/i }),
    ).toBeVisible();

    const mode = payableOrder!.cash_payment_mode_snapshot ?? "disabled";
    const expectCashButtons = mode !== "disabled";

    await expect(page.getByRole("button", { name: /100%/i })).toBeVisible();
    if (expectCashButtons) {
      await expect(page.getByRole("button", { name: /30%/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /50%/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /70%/i })).toBeVisible();
    } else {
      await expect(
        page.getByRole("button", { name: /30%/i }),
      ).toHaveCount(0);
    }

    const codButton = page.getByRole("button", { name: /cash on delivery/i });
    const payAtShopButton = page.getByRole("button", { name: /pay at shop/i });

    if (mode === "both") {
      await expect(codButton).toBeVisible();
      await expect(payAtShopButton).toBeVisible();
    } else if (mode === "cod") {
      await expect(codButton).toBeVisible();
      await expect(payAtShopButton).toHaveCount(0);
    } else if (mode === "pay_at_shop") {
      await expect(codButton).toHaveCount(0);
      await expect(payAtShopButton).toBeVisible();
    } else {
      await expect(codButton).toHaveCount(0);
      await expect(payAtShopButton).toHaveCount(0);
    }

    for (const record of payableOrder!.payment_records ?? []) {
      await expect(
        page.getByText(`Payment #${record.sequence_number} - ${record.selected_percent}%`),
      ).toBeVisible();
    }

    await page.screenshot({
      path: "tests/e2e/screenshots/order-payment-route.png",
      fullPage: true,
    });
  });
});
