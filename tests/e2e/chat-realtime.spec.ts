/**
 * Playwright smoke coverage for the modular chat real-time flow.
 *
 * This suite is intentionally environment-gated. It needs:
 *   - a live backend
 *   - a verified client account
 *   - a vendor UUID to start a conversation against
 */

import { expect, request as apiRequest, test } from "@playwright/test";

const BACKEND_URL =
  process.env.PLAYWRIGHT_BACKEND_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "http://127.0.0.1:8000";

const CHAT_EMAIL = process.env.PLAYWRIGHT_CHAT_EMAIL;
const CHAT_PASSWORD = process.env.PLAYWRIGHT_CHAT_PASSWORD;
const CHAT_VENDOR_ID = process.env.PLAYWRIGHT_CHAT_VENDOR_ID;
const missingChatEnv = !CHAT_EMAIL || !CHAT_PASSWORD || !CHAT_VENDOR_ID;

async function isBackendOnline(): Promise<boolean> {
  try {
    const ctx = await apiRequest.newContext({ timeout: 5_000 });
    const response = await ctx.get(`${BACKEND_URL}/api/v1/health/`, {
      headers: { "ngrok-skip-browser-warning": "true" },
      timeout: 5_000,
    });
    await ctx.dispose();
    return response.ok();
  } catch {
    return false;
  }
}

test.describe.configure({ mode: "serial" });

test.describe("Chat realtime smoke", () => {
  test.skip(missingChatEnv, "requires chat smoke credentials and vendor id");

  test("@smoke client can send a message and receive websocket delivery", async ({
    page,
  }) => {
    test.skip(!(await isBackendOnline()), "backend is offline");

    const ctx = await apiRequest.newContext({
      extraHTTPHeaders: { "ngrok-skip-browser-warning": "true" },
    });

    const loginResponse = await ctx.post(`${BACKEND_URL}/api/v1/auth/login/`, {
      data: {
        email_or_phone: CHAT_EMAIL,
        password: CHAT_PASSWORD,
      },
    });
    expect(loginResponse.ok()).toBeTruthy();

    const loginPayload = (await loginResponse.json()) as {
      data?: {
        access?: string;
        refresh?: string;
        user_id?: string;
        role?: string;
      };
    };
    const authData = loginPayload.data ?? {};

    expect(authData.access).toBeTruthy();
    expect(authData.user_id).toBeTruthy();

    const startConversationResponse = await ctx.post(
      `${BACKEND_URL}/api/v1/chat/conversations/start/`,
      {
        headers: {
          Authorization: `Bearer ${authData.access}`,
        },
        data: {
          vendor_id: CHAT_VENDOR_ID,
          product_title_snapshot: "Playwright chat smoke",
          initial_message: "Initial Playwright smoke thread",
        },
      },
    );
    expect(startConversationResponse.ok()).toBeTruthy();
    await ctx.dispose();

    await page.addInitScript(
      ([accessToken, refreshToken, userId]) => {
        window.sessionStorage.setItem(
          "fashionistar-auth",
          JSON.stringify({
            state: {
              accessToken,
              refreshToken,
              isAuthenticated: true,
              user: {
                id: userId,
                role: "client",
              },
            },
          }),
        );
      },
      [authData.access, authData.refresh, authData.user_id] as const,
    );

    const receivedFrames: string[] = [];
    page.on("websocket", (ws) => {
      ws.on("framereceived", (event) => {
        if (typeof event.payload === "string") {
          receivedFrames.push(event.payload);
        }
      });
    });

    await page.goto("/client/messages");
    await expect(page.getByRole("heading", { name: /messages/i })).toBeVisible();
    await expect(page.getByPlaceholder(/write a message/i)).toBeVisible();

    const outboundText = `Playwright WS smoke ${Date.now()}`;
    await page.getByPlaceholder(/write a message/i).fill(outboundText);
    await page.getByRole("button", { name: /send message/i }).click();

    await expect
      .poll(() =>
        receivedFrames.some(
          (frame) =>
            frame.includes('"type":"message.new"') && frame.includes(outboundText),
        ),
      )
      .toBeTruthy();
  });
});
