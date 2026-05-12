/**
 * Vitest Global Setup
 * Runs once before all tests.
 */
import { vi, beforeAll, afterAll } from "vitest";
import "@testing-library/jest-dom";

// Mock sessionStorage
Object.defineProperty(window, "sessionStorage", {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// Mock sonner toast (don't actually show toasts in tests)
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
  Toaster: vi.fn(() => null),
}));

// Suppress console.error noise in tests (only show meaningful errors)
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("ReactDOM.render") ||
        args[0].includes("Warning:"))
    ) {
      return;
    }
    originalConsoleError(...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
});
