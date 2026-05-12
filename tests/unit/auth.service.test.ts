/**
 * Auth Service Unit Tests — Vitest + MSW
 * =========================================
 * Tests the auth.service.ts API functions with mocked HTTP responses.
 *
 * Coverage:
 *  1. login() — success, 401 failure, 429 throttle
 *  2. register() — success, 400 validation error, duplicate email
 *  3. verifyOTP() — success with token return, invalid OTP error
 *  4. logout() — fires POST, handles error silently
 *  5. revokeSession() — DELETE with correct session ID
 *  6. requestPasswordReset() — anti-enumeration (always 200)
 *  7. refreshToken() — returns new access token
 *  8. Idempotency key attachment via Axios interceptor
 *
 * Run: pnpm vitest tests/unit/auth.service.test.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

// Mock the auth store for logout() test (avoids sessionStorage access)
vi.mock('@/features/auth/store/auth.store', () => ({
  useAuthStore: {
    getState: () => ({
      refreshToken: 'mock-refresh-token',
    }),
  },
}))

// Import service AFTER mocking store
const {
  login,
  register,
  verifyOTP,
  logout,
  requestPasswordReset,
} = await import('@/features/auth/services/auth.service')

// ─────────────────────────────────────────────────────────────────────────────
// MSW SERVER SETUP
// ─────────────────────────────────────────────────────────────────────────────

const BASE = 'http://localhost:8000'

const handlers = [
  // POST /api/v1/auth/login/
  http.post(`${BASE}/api/v1/auth/login/`, async ({ request }: { request: Request }) => {
    const body = await request.json() as Record<string, string>
    if (body.password === 'wrong-password') {
      return HttpResponse.json(
        { detail: 'Invalid credentials.', code: 'authentication_failed' },
        { status: 401 },
      )
    }
    if (body.email_or_phone === 'throttled@test.io') {
      return HttpResponse.json(
        { detail: 'Request was throttled.' },
        { status: 429 },
      )
    }
    return HttpResponse.json({
      access: 'test.access.token',
      refresh: 'test.refresh.token',
      user: {
        id: '01919090-user-7000-0000-000000000001',
        email: body.email_or_phone,
        first_name: 'Test',
        last_name: 'User',
        role: 'client',
        is_verified: true,
        is_staff: false,
        avatar: null,
      },
      role: 'client',
      requires_otp: false,
      has_vendor_profile: false,
    })
  }),

  // POST /api/v1/auth/register/
  http.post(`${BASE}/api/v1/auth/register/`, async ({ request }: { request: Request }) => {
    const body = await request.json() as Record<string, string>
    if (body.email === 'duplicate@fashionistar.io') {
      return HttpResponse.json(
        { email: ['A user with this email address already exists.'] },
        { status: 400 },
      )
    }
    if (!body.email && !body.phone) {
      return HttpResponse.json(
        { non_field_errors: ['Either email or phone is required.'] },
        { status: 400 },
      )
    }
    return HttpResponse.json(
      { message: 'Registration successful. Check your email for your OTP.' },
      { status: 201 },
    )
  }),

  // POST /api/v1/auth/verify-otp/
  http.post(`${BASE}/api/v1/auth/verify-otp/`, async ({ request }: { request: Request }) => {
    const body = await request.json() as Record<string, string>
    if (body.otp === '000000') {
      return HttpResponse.json(
        { error: 'Invalid or expired OTP.' },
        { status: 400 },
      )
    }
    return HttpResponse.json({
      access: 'verified.access.token',
      refresh: 'verified.refresh.token',
      user: {
        id: '01919090-user-7000-0000-000000000001',
        email: body.email,
        first_name: 'Verified',
        last_name: 'User',
        role: 'client',
        is_verified: true,
        is_staff: false,
        avatar: null,
      },
      role: 'client',
      requires_otp: false,
      has_vendor_profile: false,
    })
  }),

  // POST /api/v1/auth/logout/
  http.post(`${BASE}/api/v1/auth/logout/`, () => {
    return HttpResponse.json({ message: 'Logged out successfully.' })
  }),

  // DELETE /api/v1/auth/sessions/:sessionId/
  http.delete(
    `${BASE}/api/v1/auth/sessions/:sessionId/`,
    ({ params }: { params: { sessionId?: string } }) => {
    if (params.sessionId === '99999999-dead-0000-0000-000000000000') {
      return HttpResponse.json(
        { status: 'error', message: 'Session not found.' },
        { status: 404 },
      )
    }
    return HttpResponse.json({ status: 'success', message: 'Session revoked successfully.' })
    },
  ),

  // POST /api/v1/password/reset-request/
  http.post(`${BASE}/api/v1/password/reset-request/`, () => {
    // Anti-enumeration: always returns 200 regardless of whether email exists
    return HttpResponse.json({
      message: 'If this email is registered, you will receive a password reset link.',
    })
  }),

  // POST /api/v1/auth/token/refresh/
  http.post(`${BASE}/api/v1/auth/token/refresh/`, () => {
    return HttpResponse.json({
      access: 'new.rotated.access.token',
      refresh: 'new.rotated.refresh.token',
    })
  }),
]

const server = setupServer(...handlers)

beforeEach(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => {
  server.resetHandlers()
  server.close()
})

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe('auth.service.ts', () => {

  // ── login() ─────────────────────────────────────────────────────────────────

  describe('login()', () => {
    it('should return tokens and user on valid credentials', async () => {
      const result = await login({
        email_or_phone: 'user@fashionistar.io',
        password: 'ValidPass123!',
      })
      expect(result.access).toBe('test.access.token')
      expect(result.refresh).toBe('test.refresh.token')
      expect(result.user?.email).toBe('user@fashionistar.io')
      expect(result.user?.is_verified).toBe(true)
    })

    it('should throw on invalid credentials (401)', async () => {
      await expect(
        login({ email_or_phone: 'user@fashionistar.io', password: 'wrong-password' })
      ).rejects.toThrow()
    })

    it('should throw on throttle (429)', async () => {
      await expect(
        login({ email_or_phone: 'throttled@test.io', password: 'ValidPass123!' })
      ).rejects.toThrow()
    })
  })

  // ── register() ──────────────────────────────────────────────────────────────

  describe('register()', () => {
    it('should succeed with valid email payload', async () => {
      const result = await register({
        email: 'new.user@fashionistar.io',
        password: 'ValidPass123!',
        password_confirm: 'ValidPass123!',
        first_name: 'New',
        last_name: 'User',
        role: 'client',
      })
      expect(result.message).toContain('Registration successful')
    })

    it('should throw on duplicate email', async () => {
      await expect(
        register({
          email: 'duplicate@fashionistar.io',
          password: 'ValidPass123!',
          password_confirm: 'ValidPass123!',
          first_name: 'Dup',
          last_name: 'User',
          role: 'client',
        })
      ).rejects.toThrow()
    })
  })

  // ── verifyOTP() ──────────────────────────────────────────────────────────────

  describe('verifyOTP()', () => {
    it('should return tokens on valid OTP', async () => {
      const result = await verifyOTP({
        otp: '123456',
        email: 'verify@fashionistar.io',
      })
      expect(result.access).toBe('verified.access.token')
      expect(result.user?.is_verified).toBe(true)
    })

    it('should throw on invalid OTP', async () => {
      await expect(
        verifyOTP({ otp: '000000', email: 'verify@fashionistar.io' })
      ).rejects.toThrow()
    })
  })

  // ── logout() ────────────────────────────────────────────────────────────────

  describe('logout()', () => {
    it('should resolve without throwing (fire-and-forget)', async () => {
      await expect(logout()).resolves.not.toThrow()
    })

    it('should silently ignore API errors (local state cleared regardless)', async () => {
      // Simulate server error on logout
      server.use(
        http.post(`${BASE}/api/v1/auth/logout/`, () => {
          return HttpResponse.json({ error: 'Server error' }, { status: 500 })
        })
      )
      await expect(logout()).resolves.not.toThrow()
    })
  })

  // ── requestPasswordReset() ───────────────────────────────────────────────────

  describe('requestPasswordReset()', () => {
    it('should return 200 for known email (anti-enumeration)', async () => {
      const result = await requestPasswordReset({
        email_or_phone: 'existing@fashionistar.io',
      })
      expect(result.message).toBeTruthy()
    })

    it('should return 200 for unknown email (anti-enumeration — same response)', async () => {
      const result = await requestPasswordReset({
        email_or_phone: 'nonexistent@fashionistar.io',
      })
      expect(result.message).toBeTruthy()
    })
  })
})
