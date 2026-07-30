/**
 * Auth Service Unit Tests — Vitest + vi.mock
 * ==========================================
 * Tests auth.service.ts API functions by mocking the underlying apiSync
 * Axios instance directly. This avoids the jsdom URL-resolution issue where
 * getClientBackendRootUrl() returns "" (browser env), making apiSync.baseURL
 * a relative "/api" path that MSW Node cannot intercept.
 *
 * Pattern: mock apiSync module → stub .post/.get/.delete per test → assert.
 *
 * Coverage:
 *  1. login() — success, 401 failure, 429 throttle
 *  2. register() — success, 400 validation error, duplicate email
 *  3. verifyOTP() — success with token return, invalid OTP error
 *  4. logout() — fires POST, handles error silently
 *  5. requestPasswordReset() — anti-enumeration (always 200)
 *
 * Run: pnpm vitest tests/unit/auth.service.test.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ─── Mock apiSync BEFORE any module that uses it is imported ─────────────────
// apiSync is an Axios instance; we stub the individual methods so no network
// requests fire. Each test group can override the resolved/rejected value.

const mockApiSync = {
  post:    vi.fn(),
  get:     vi.fn(),
  delete:  vi.fn(),
  interceptors: {
    request:  { use: vi.fn(), eject: vi.fn() },
    response: { use: vi.fn(), eject: vi.fn() },
  },
  defaults: { headers: { common: {} } },
}

vi.mock('@/core/api/client.sync', () => ({
  apiSync:             mockApiSync,
  resetCircuitBreaker: vi.fn(),
  default:             mockApiSync,
}))

// Mock auth store (avoids sessionStorage)
vi.mock('@/features/auth/store/auth.store', () => ({
  useAuthStore: {
    getState: () => ({ refreshToken: 'mock-refresh-token' }),
  },
}))

// Import service AFTER mocks are registered
const {
  login,
  register,
  verifyOTP,
  logout,
  requestPasswordReset,
} = await import('@/features/auth/services/auth.service')

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const MOCK_TOKENS = {
  access:  'test.access.token',
  refresh: 'test.refresh.token',
}

const MOCK_USER = {
  user_id:          '01919090-user-7000-0000-000000000001',
  email:            'user@fashionistar.io',
  first_name:       'Test',
  last_name:        'User',
  role:             'client',
  is_verified:      true,
  is_staff:         false,
  avatar:           null,
}

const LOGIN_SUCCESS_DATA = {
  ...MOCK_TOKENS,
  user:              MOCK_USER,
  role:              'client',
  requires_otp:      false,
  has_vendor_profile: false,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Make apiSync.post resolve with the given response data */
function mockPostSuccess<T>(data: T) {
  mockApiSync.post.mockResolvedValueOnce({ data })
}

/** Make apiSync.post reject with an Axios-shaped error */
function mockPostError(status: number, data: unknown) {
  const err = Object.assign(new Error('Request failed'), {
    isAxiosError: true,
    response: { status, data },
  })
  mockApiSync.post.mockRejectedValueOnce(err)
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST LIFECYCLE
// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe('auth.service.ts', () => {

  // ── login() ────────────────────────────────────────────────────────────────

  describe('login()', () => {
    it('should return tokens and user on valid credentials', async () => {
      mockPostSuccess(LOGIN_SUCCESS_DATA)

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
      mockPostError(401, { detail: 'Invalid credentials.', code: 'authentication_failed' })

      await expect(
        login({ email_or_phone: 'user@fashionistar.io', password: 'wrong-password' })
      ).rejects.toThrow()
    })

    it('should throw on throttle (429)', async () => {
      mockPostError(429, { detail: 'Request was throttled.' })

      await expect(
        login({ email_or_phone: 'throttled@test.io', password: 'ValidPass123!' })
      ).rejects.toThrow()
    })
  })

  // ── register() ─────────────────────────────────────────────────────────────

  describe('register()', () => {
    it('should succeed with valid email payload', async () => {
      mockPostSuccess({ message: 'Registration successful. Check your email for your OTP.' })

      const result = await register({
        email:            'new.user@fashionistar.io',
        password:         'ValidPass123!',
        password_confirm: 'ValidPass123!',
        first_name:       'New',
        last_name:        'User',
        role:             'client',
      })

      expect(result.message).toContain('Registration successful')
    })

    it('should throw on duplicate email (400)', async () => {
      mockPostError(400, { email: ['A user with this email address already exists.'] })

      await expect(
        register({
          email:            'duplicate@fashionistar.io',
          password:         'ValidPass123!',
          password_confirm: 'ValidPass123!',
          first_name:       'Dup',
          last_name:        'User',
          role:             'client',
        })
      ).rejects.toThrow()
    })
  })

  // ── verifyOTP() ────────────────────────────────────────────────────────────

  describe('verifyOTP()', () => {
    it('should return tokens on valid OTP', async () => {
      mockPostSuccess({
        ...MOCK_TOKENS,
        user:              { ...MOCK_USER, is_verified: true },
        role:              'client',
        requires_otp:      false,
        has_vendor_profile: false,
      })

      const result = await verifyOTP({
        otp:   '123456',
        email: 'verify@fashionistar.io',
      })

      expect(result.access).toBe('test.access.token')
      expect(result.user?.is_verified).toBe(true)
    })

    it('should throw on invalid OTP (400)', async () => {
      mockPostError(400, { error: 'Invalid or expired OTP.' })

      await expect(
        verifyOTP({ otp: '000000', email: 'verify@fashionistar.io' })
      ).rejects.toThrow()
    })
  })

  // ── logout() ───────────────────────────────────────────────────────────────

  describe('logout()', () => {
    it('should resolve without throwing (fire-and-forget)', async () => {
      mockPostSuccess({ message: 'Logged out successfully.' })

      await expect(logout()).resolves.not.toThrow()
    })

    it('should silently ignore API errors (local state cleared regardless)', async () => {
      mockPostError(500, { error: 'Server error' })

      // logout() swallows errors — state is cleared locally regardless
      await expect(logout()).resolves.not.toThrow()
    })
  })

  // ── requestPasswordReset() ─────────────────────────────────────────────────

  describe('requestPasswordReset()', () => {
    const RESET_RESPONSE = {
      message: 'If this email is registered, you will receive a password reset link.',
    }

    it('should return 200 for known email (anti-enumeration)', async () => {
      mockPostSuccess(RESET_RESPONSE)

      const result = await requestPasswordReset({
        email_or_phone: 'existing@fashionistar.io',
      })

      expect(result.message).toBeTruthy()
    })

    it('should return 200 for unknown email (anti-enumeration — same response)', async () => {
      mockPostSuccess(RESET_RESPONSE)

      const result = await requestPasswordReset({
        email_or_phone: 'nonexistent@fashionistar.io',
      })

      expect(result.message).toBeTruthy()
    })
  })
})
