/**
 * Auth API barrel — re-exports all auth service functions
 * for backward-compatible imports from "@/features/auth/api"
 */
export {
  // Core auth
  login,
  register,
  verifyOTP,
  resendOTP,
  googleAuth,
  logout,
  refreshToken,
  // Profile
  getMe,
  // Session management
  getSessions,
  revokeSession,
  revokeOtherSessions,
  // Login activity
  getLoginEvents,
  // Password management
  requestPasswordReset,
  confirmPasswordResetEmail,
  confirmPasswordResetPhone,
  changePassword,
} from "@/features/auth/services/auth.service";
