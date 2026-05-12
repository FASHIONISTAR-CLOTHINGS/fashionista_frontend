import { test, expect } from "@playwright/test";

test.describe("Wallet & P2P Transfer End-to-End", () => {
  test.beforeEach(async ({ page }) => {
    // 1. Login as sender
    await page.goto("/auth/login");
    await page.fill('input[name="email"]', 'sender@fashionistar.ai');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard/client');
  });

  test('User can view balance and perform a P2P transfer', async ({ page }) => {
    // 2. Navigate to Wallet
    await page.click('a[href="/dashboard/client/wallet"]');
    await expect(page.locator('h1')).toContainText('My Wallet');

    // 3. Check initial balance
    const balance = page.locator('[data-testid="wallet-balance"]');
    await expect(balance).not.toBeEmpty();

    // 4. Initiate Transfer
    await page.click('button:has-text("Send Money")');
    await page.fill('input[name="receiver"]', 'receiver@fashionistar.ai');
    await page.fill('input[name="amount"]', '10');
    await page.click('button:has-text("Continue")');

    // 5. PIN Verification Modal
    await expect(page.locator('text=Enter Transaction PIN')).toBeVisible();
    await page.type('input[name="pin"]', '1234');
    await page.click('button:has-text("Confirm Transfer")');

    // 6. Success Feedback
    await expect(page.locator('text=Transfer Successful')).toBeVisible();
    await page.click('button:has-text("Close")');

    // 7. Verify balance updated
    // (Assuming balance decreases by 10)
  });
});
