/**
 * Auth Store Unit Tests — Vitest
 * ================================
 * Tests the Zustand auth store for:
 *  1. Initial state correctness
 *  2. setTokens — sets both tokens + isAuthenticated=true
 *  3. setUser — stores user object with all fields
 *  4. setToken — single token set
 *  5. logout — clears all auth state
 *  6. clearAuth — alias for logout, same behavior
 *  7. setPendingOTP — stores email and phone for OTP flow
 *  8. setLoading — toggles loading flag
 *  9. Selectors — selectIsAuthenticated, selectUser, selectToken
 *
 * Run: pnpm vitest tests/unit/auth.store.advanced.test.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'

// Mock the auth-session.client module (uses document.cookie — not available in jsdom)
vi.mock('@/features/auth/lib/auth-session.client', () => ({
  buildAuthSessionMirror: vi.fn(() => ({})),
  clearMirrorCookies: vi.fn(),
  syncMirrorCookies: vi.fn(),
}))

// Dynamically import AFTER mocking
const { useAuthStore, selectIsAuthenticated, selectUser, selectToken } = await import(
  '@/features/auth/store/auth.store'
)

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_USER = {
  id: '01919090-user-7000-0000-000000000001',
  email: 'test@fashionistar.io',
  first_name: 'Fashion',
  last_name: 'Star',
  role: 'client',
  is_verified: true,
  is_staff: false,
  avatar: null,
}

const MOCK_ACCESS  = 'eyJhcc.access.token'
const MOCK_REFRESH = 'eyJhcc.refresh.token'

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset to initial state before each test
    act(() => {
      useAuthStore.getState().logout()
    })
  })

  // ── 1. Initial State ────────────────────────────────────────────────────────

  describe('Initial State', () => {
    it('should have null tokens and user on init', () => {
      const state = useAuthStore.getState()
      expect(state.accessToken).toBeNull()
      expect(state.refreshToken).toBeNull()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
    })

    it('should have undefined pendingOTPEmail and pendingOTPPhone on init', () => {
      const state = useAuthStore.getState()
      expect(state.pendingOTPEmail).toBeUndefined()
      expect(state.pendingOTPPhone).toBeUndefined()
    })
  })

  // ── 2. setTokens ────────────────────────────────────────────────────────────

  describe('setTokens()', () => {
    it('should set both access and refresh tokens', () => {
      act(() => {
        useAuthStore.getState().setTokens(MOCK_ACCESS, MOCK_REFRESH)
      })
      const state = useAuthStore.getState()
      expect(state.accessToken).toBe(MOCK_ACCESS)
      expect(state.refreshToken).toBe(MOCK_REFRESH)
    })

    it('should set isAuthenticated to true', () => {
      act(() => {
        useAuthStore.getState().setTokens(MOCK_ACCESS, MOCK_REFRESH)
      })
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
    })

    it('should not clear user when called', () => {
      act(() => {
        useAuthStore.getState().setUser(MOCK_USER)
        useAuthStore.getState().setTokens(MOCK_ACCESS, MOCK_REFRESH)
      })
      expect(useAuthStore.getState().user).toEqual(MOCK_USER)
    })
  })

  // ── 3. setUser ──────────────────────────────────────────────────────────────

  describe('setUser()', () => {
    it('should store user object with all fields', () => {
      act(() => {
        useAuthStore.getState().setUser(MOCK_USER)
      })
      const user = useAuthStore.getState().user
      expect(user).toEqual(MOCK_USER)
      expect(user?.id).toBe(MOCK_USER.id)
      expect(user?.email).toBe(MOCK_USER.email)
      expect(user?.role).toBe('client')
      expect(user?.is_verified).toBe(true)
    })

    it('should handle user with null avatar', () => {
      act(() => {
        useAuthStore.getState().setUser({ ...MOCK_USER, avatar: null })
      })
      expect(useAuthStore.getState().user?.avatar).toBeNull()
    })

    it('should handle vendor role correctly', () => {
      act(() => {
        useAuthStore.getState().setUser({ ...MOCK_USER, role: 'vendor' })
      })
      expect(useAuthStore.getState().user?.role).toBe('vendor')
    })
  })

  // ── 4. setToken ─────────────────────────────────────────────────────────────

  describe('setToken()', () => {
    it('should set accessToken and isAuthenticated', () => {
      act(() => {
        useAuthStore.getState().setToken(MOCK_ACCESS)
      })
      const state = useAuthStore.getState()
      expect(state.accessToken).toBe(MOCK_ACCESS)
      expect(state.isAuthenticated).toBe(true)
    })
  })

  // ── 5. logout ───────────────────────────────────────────────────────────────

  describe('logout()', () => {
    it('should clear all auth state', () => {
      // Set up authenticated state
      act(() => {
        useAuthStore.getState().setTokens(MOCK_ACCESS, MOCK_REFRESH)
        useAuthStore.getState().setUser(MOCK_USER)
        useAuthStore.getState().setPendingOTP({ email: 'test@test.com' })
      })

      // Logout
      act(() => {
        useAuthStore.getState().logout()
      })

      const state = useAuthStore.getState()
      expect(state.accessToken).toBeNull()
      expect(state.refreshToken).toBeNull()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.pendingOTPEmail).toBeUndefined()
      expect(state.pendingOTPPhone).toBeUndefined()
    })
  })

  // ── 6. clearAuth ────────────────────────────────────────────────────────────

  describe('clearAuth()', () => {
    it('should behave identically to logout()', () => {
      act(() => {
        useAuthStore.getState().setTokens(MOCK_ACCESS, MOCK_REFRESH)
        useAuthStore.getState().setUser(MOCK_USER)
      })

      act(() => {
        useAuthStore.getState().clearAuth()
      })

      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(false)
      expect(state.user).toBeNull()
      expect(state.accessToken).toBeNull()
    })
  })

  // ── 7. setPendingOTP ────────────────────────────────────────────────────────

  describe('setPendingOTP()', () => {
    it('should set email for OTP flow', () => {
      act(() => {
        useAuthStore.getState().setPendingOTP({ email: 'otp@fashionistar.io' })
      })
      expect(useAuthStore.getState().pendingOTPEmail).toBe('otp@fashionistar.io')
      expect(useAuthStore.getState().pendingOTPPhone).toBeUndefined()
    })

    it('should set phone for OTP flow', () => {
      act(() => {
        useAuthStore.getState().setPendingOTP({ phone: '+2348012345678' })
      })
      expect(useAuthStore.getState().pendingOTPPhone).toBe('+2348012345678')
      expect(useAuthStore.getState().pendingOTPEmail).toBeUndefined()
    })

    it('should set both email and phone', () => {
      act(() => {
        useAuthStore.getState().setPendingOTP({
          email: 'both@fashionistar.io',
          phone: '+2348012345678',
        })
      })
      const state = useAuthStore.getState()
      expect(state.pendingOTPEmail).toBe('both@fashionistar.io')
      expect(state.pendingOTPPhone).toBe('+2348012345678')
    })
  })

  // ── 8. setLoading ───────────────────────────────────────────────────────────

  describe('setLoading()', () => {
    it('should toggle loading state', () => {
      act(() => { useAuthStore.getState().setLoading(true) })
      expect(useAuthStore.getState().isLoading).toBe(true)

      act(() => { useAuthStore.getState().setLoading(false) })
      expect(useAuthStore.getState().isLoading).toBe(false)
    })
  })

  // ── 9. Selectors ────────────────────────────────────────────────────────────

  describe('Selectors', () => {
    it('selectIsAuthenticated returns correct value', () => {
      act(() => { useAuthStore.getState().setTokens(MOCK_ACCESS, MOCK_REFRESH) })
      expect(selectIsAuthenticated(useAuthStore.getState())).toBe(true)

      act(() => { useAuthStore.getState().logout() })
      expect(selectIsAuthenticated(useAuthStore.getState())).toBe(false)
    })

    it('selectUser returns user object', () => {
      act(() => { useAuthStore.getState().setUser(MOCK_USER) })
      expect(selectUser(useAuthStore.getState())).toEqual(MOCK_USER)
    })

    it('selectToken returns access token', () => {
      act(() => { useAuthStore.getState().setTokens(MOCK_ACCESS, MOCK_REFRESH) })
      expect(selectToken(useAuthStore.getState())).toBe(MOCK_ACCESS)
    })

    it('selectToken returns null when not authenticated', () => {
      expect(selectToken(useAuthStore.getState())).toBeNull()
    })
  })

  // ── 10. State Transitions (full auth lifecycle) ─────────────────────────────

  describe('Full Auth Lifecycle', () => {
    it('should handle complete login → use → logout cycle', () => {
      // Login
      act(() => {
        useAuthStore.getState().setTokens(MOCK_ACCESS, MOCK_REFRESH)
        useAuthStore.getState().setUser(MOCK_USER)
      })

      let state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(true)
      expect(state.user?.email).toBe('test@fashionistar.io')
      expect(state.accessToken).toBe(MOCK_ACCESS)

      // Logout
      act(() => {
        useAuthStore.getState().logout()
      })

      state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(false)
      expect(state.user).toBeNull()
      expect(state.accessToken).toBeNull()
      expect(state.refreshToken).toBeNull()
    })

    it('should handle OTP flow: registration → setPendingOTP → verify → setTokens', () => {
      // User registered, OTP pending
      act(() => {
        useAuthStore.getState().setPendingOTP({ email: 'new@fashionistar.io' })
      })
      expect(useAuthStore.getState().pendingOTPEmail).toBe('new@fashionistar.io')
      expect(useAuthStore.getState().isAuthenticated).toBe(false)

      // OTP verified → tokens set
      act(() => {
        useAuthStore.getState().setTokens(MOCK_ACCESS, MOCK_REFRESH)
        useAuthStore.getState().setUser(MOCK_USER)
      })

      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(true)
      expect(state.accessToken).toBe(MOCK_ACCESS)
    })
  })
})
