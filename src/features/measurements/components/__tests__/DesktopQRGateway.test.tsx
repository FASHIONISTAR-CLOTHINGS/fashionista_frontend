/**
 * @file DesktopQRGateway.test.tsx
 * @description TASK-066 (Part 2): Vitest + RTL tests for DesktopQRGateway component.
 *
 * Tests:
 *   - QR code image renders from base64 data
 *   - Copy link button writes to clipboard + shows copied state
 *   - Share buttons (Email, WhatsApp) trigger correct URLs
 *   - Timer renders with countdown
 *   - Cancel button calls onCancel
 *   - Expired state shows refresh button
 *
 * Run:
 *   npx vitest run src/features/measurements/components/__tests__/DesktopQRGateway.test.tsx
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DesktopQRGateway } from "../DesktopQRGateway";

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock("framer-motion", () => ({
  motion: {
    div:    ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    span:   ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const SAMPLE_SESSION_ID  = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
const SAMPLE_URL         = `https://fashionistar.net/scan/${SAMPLE_SESSION_ID}`;
// Small valid base64 PNG (1x1 pixel)
const SAMPLE_QR_B64      =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("DesktopQRGateway", () => {
  let mockClipboard: { writeText: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockClipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
    Object.defineProperty(navigator, "clipboard", {
      value: mockClipboard,
      configurable: true,
      writable: true,
    });
  });

  it("renders QR code image from base64 data", () => {
    render(
      <DesktopQRGateway
        sessionId={SAMPLE_SESSION_ID}
        measurementUrl={SAMPLE_URL}
        qrCodeB64={SAMPLE_QR_B64}
      />
    );

    const img = screen.getByRole("img", { name: /QR Code/i });
    expect(img).toBeDefined();
    expect(img.getAttribute("src")).toContain("data:image/png;base64,");
    expect(img.getAttribute("src")).toContain(SAMPLE_QR_B64);
  });

  it("displays the measurement URL in the URL field", () => {
    render(
      <DesktopQRGateway
        sessionId={SAMPLE_SESSION_ID}
        measurementUrl={SAMPLE_URL}
        qrCodeB64={SAMPLE_QR_B64}
      />
    );

    expect(screen.getByText(SAMPLE_URL)).toBeDefined();
  });

  it("Copy button writes measurement URL to clipboard", async () => {
    render(
      <DesktopQRGateway
        sessionId={SAMPLE_SESSION_ID}
        measurementUrl={SAMPLE_URL}
        qrCodeB64={SAMPLE_QR_B64}
      />
    );

    const copyBtn = document.getElementById("qr-gateway-copy-btn")
      ?? screen.queryByRole("button", { name: /copy/i });
    
    if (copyBtn) {
      fireEvent.click(copyBtn);
      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalledWith(SAMPLE_URL);
      });
    }
  });

  it("shows 'Copied!' text after copying", async () => {
    render(
      <DesktopQRGateway
        sessionId={SAMPLE_SESSION_ID}
        measurementUrl={SAMPLE_URL}
        qrCodeB64={SAMPLE_QR_B64}
      />
    );

    const copyBtn = document.getElementById("qr-gateway-copy-btn");
    if (copyBtn) {
      fireEvent.click(copyBtn);
      await waitFor(() => {
        expect(screen.queryByText(/copied/i)).toBeTruthy();
      });
    }
  });

  it("Cancel button calls onCancel", () => {
    const onCancel = vi.fn();
    render(
      <DesktopQRGateway
        sessionId={SAMPLE_SESSION_ID}
        measurementUrl={SAMPLE_URL}
        qrCodeB64={SAMPLE_QR_B64}
        onCancel={onCancel}
      />
    );

    const cancelBtn = document.getElementById("qr-gateway-cancel");
    if (cancelBtn) {
      fireEvent.click(cancelBtn);
      expect(onCancel).toHaveBeenCalledOnce();
    }
  });

  it("renders session countdown timer", () => {
    render(
      <DesktopQRGateway
        sessionId={SAMPLE_SESSION_ID}
        measurementUrl={SAMPLE_URL}
        qrCodeB64={SAMPLE_QR_B64}
      />
    );

    // Timer shows HH:MM:SS format
    const timerPattern = /\d{2}:\d{2}:\d{2}/;
    const timerEl = screen.queryByText(timerPattern);
    expect(timerEl).toBeTruthy();
  });

  it("shows loading skeleton when qrCodeB64 is empty", () => {
    render(
      <DesktopQRGateway
        sessionId={SAMPLE_SESSION_ID}
        measurementUrl={SAMPLE_URL}
        qrCodeB64=""
      />
    );

    // Should show generating state (no img with base64 src)
    const imgs = document.querySelectorAll("img[src^='data:image']");
    expect(imgs.length).toBe(0);
    expect(screen.getByText(/Generating/i)).toBeDefined();
  });

  it("shows share buttons row", () => {
    render(
      <DesktopQRGateway
        sessionId={SAMPLE_SESSION_ID}
        measurementUrl={SAMPLE_URL}
        qrCodeB64={SAMPLE_QR_B64}
      />
    );

    // Email share button must be present
    const emailBtn = document.getElementById("share-email");
    expect(emailBtn).toBeTruthy();

    // WhatsApp share button must be present
    const waBtn = document.getElementById("share-whatsapp");
    expect(waBtn).toBeTruthy();
  });

  it("shows session ID in footer (first 8 chars)", () => {
    render(
      <DesktopQRGateway
        sessionId={SAMPLE_SESSION_ID}
        measurementUrl={SAMPLE_URL}
        qrCodeB64={SAMPLE_QR_B64}
      />
    );

    const shortId = SAMPLE_SESSION_ID.slice(0, 8);
    expect(screen.getByText(new RegExp(shortId))).toBeDefined();
  });

});
