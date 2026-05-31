import { expect, test } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const TIMEOUT_MS = 15_000;

test.describe("Public funnel proof", () => {
  test("homepage lead-capture inputs are visible", async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: TIMEOUT_MS });

    await expect(page.getByTestId("newsletter-email-input")).toBeVisible();
    await expect(page.getByTestId("newsletter-submit")).toBeVisible();
    await expect(page.getByTestId("waitlist-email-input")).toHaveCount(1);
    await expect(page.getByTestId("waitlist-submit")).toHaveCount(1);
  });

  test("contact form exposes real submission controls", async ({ page }) => {
    await page.goto(`${BASE_URL}/contact-us`, {
      waitUntil: "domcontentloaded",
      timeout: TIMEOUT_MS,
    });

    await expect(page.getByTestId("contact-name-input")).toBeVisible();
    await expect(page.getByTestId("contact-email-input")).toBeVisible();
    await expect(page.getByTestId("contact-message-input")).toBeVisible();
    await expect(page.getByTestId("contact-submit")).toBeVisible();
  });
});
