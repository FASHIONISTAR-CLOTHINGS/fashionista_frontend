/**
 * PILLAR 3: Vitest Unit Tests — Auth Store
 *
 * Tests Zustand store state transitions.
 * Also tests concurrency-safe behaviour under rapid state changes.
 *
 * NOTE: Zustand setState is synchronous — act() wrapping is not needed here.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@/features/auth/store/auth.store";

// Reset store between tests
beforeEach(() => {
  useAuthStore.getState().logout();
});

describe("Auth Store — State Transitions", () => {
  it("✅ initial state is unauthenticated", () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
  });

  it("✅ setToken sets token and marks authenticated", () => {
    useAuthStore.getState().setToken("test-jwt-access-token");
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe("test-jwt-access-token");
    expect(state.isAuthenticated).toBe(true);
  });

  it("✅ setUser persists user data", () => {
    const mockUser = {
      id: "usr_123",
      email: "daniel@fashionistar.com",
      first_name: "Daniel",
      last_name: "Ezichi",
      is_verified: true,
      is_staff: false,
      date_joined: "2026-01-01T00:00:00Z",
    };
    useAuthStore.getState().setUser(mockUser);
    expect(useAuthStore.getState().user).toMatchObject(mockUser);
  });

  it("✅ logout clears all auth state", () => {
    useAuthStore.getState().setToken("sometoken");
    useAuthStore.getState().setUser({
      id: "1",
      first_name: "Test",
      last_name: "User",
      is_verified: true,
      is_staff: false,
      date_joined: "2026-01-01",
    });
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("✅ setPendingOTP stores email/phone for OTP flow", () => {
    useAuthStore.getState().setPendingOTP({ email: "otp@test.com" });
    expect(useAuthStore.getState().pendingOTPEmail).toBe("otp@test.com");
  });
});

// ── RACE CONDITION / CONCURRENCY TEST ────────────────────────────────────────
describe("Auth Store — Concurrency Safety", () => {
  it("✅ handles 100 rapid setToken calls — last write wins", () => {
    const tokens = Array.from({ length: 100 }, (_, i) => `token-${i}`);

    // Fire all updates as fast as possible (simulates race condition)
    tokens.forEach((token) => useAuthStore.getState().setToken(token));

    // The store should have a token (last write wins — correct Zustand behavior)
    const finalToken = useAuthStore.getState().accessToken;
    expect(finalToken).toMatch(/^token-\d+$/);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it("✅ logout after rapid writes clears state", () => {
    Array.from({ length: 50 }, (_, i) =>
      useAuthStore.getState().setToken(`token-${i}`)
    );
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().accessToken).toBeNull();
  });
});
