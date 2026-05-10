/**
 * Auth Zod Schemas — Frontend Data Contracts
 *
 * Zero-trust validation: every user input and API response is validated.
 * Aligned with backend Django serializers in apps/authentication/
 *
 * Phone validation strategy:
 *  - Uses libphonenumber-js (Google's libphonenumber, industry standard)
 *  - Country code selector normalises to E.164 BEFORE this schema runs
 *  - The PhoneInputField component calls normalisePhone() on every keystroke
 *  - Schema validates the already-normalised E.164 string
 */
import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

// ── Shared phone schema ───────────────────────────────────────────────────────
// The PhoneInputField normalises to E.164 before this validator runs.
// We use libphonenumber-js for production-grade multi-country validation.
const phoneFieldSchema = z
  .string()
  .refine(
    (val) => {
      if (!val || val === "") return true; // optional fields pass empty
      return isValidPhoneNumber(val);
    },
    {
      message:
        "Please enter a valid phone number (select your country code and enter the number without the leading 0)",
    },
  );

const ProfileSnapshotSchema = z.record(z.unknown()).nullable().optional();

// ── Login ─────────────────────────────────────────────────────────────────────
// Backend serializer field is `email_or_phone` (accepts email OR phone in E.164)
export const LoginSchema = z.object({
  email_or_phone: z
    .string()
    .min(1, "Email or phone is required")
    .refine(
      (val) => {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        const isPhone = isValidPhoneNumber(val) || /^\+\d{10,15}$/.test(val);
        return isEmail || isPhone;
      },
      "Please enter a valid email address or phone number",
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

export type LoginPayload = z.infer<typeof LoginSchema>;

// ── Login Response ─────────────────────────────────────────────────────
// Matches backend LoginView + GoogleAuthView response shape.
// GoogleAuthView returns: { status, message, is_new, tokens: { access, refresh }, user: {...} }
// LoginView returns:      { message, access, refresh, role, user_id, identifying_info }
// We handle BOTH shapes with optional fields.
export const LoginResponseSchema = z.object({
  // ── Standard login / OTP verify fields ───────────────────────────────
  message:          z.string().optional(),
  access:           z.string().min(1).optional(),
  refresh:          z.string().optional(),
  user_id:          z.string().optional(),
  role:             z.string().optional(),
  identifying_info: z.string().optional(),
  requires_otp:     z.boolean().optional().default(false),
  has_vendor_profile: z.boolean().optional().default(false),
  has_client_profile: z.boolean().optional().default(false),
  vendor_profile: ProfileSnapshotSchema,
  client_profile: ProfileSnapshotSchema,

  // ── Google OAuth response fields ──────────────────────────────────────
  status:  z.string().optional(),   // "success"
  is_new:  z.boolean().optional(),  // true = new registration
  tokens: z
    .object({
      access:  z.string().min(1),
      refresh: z.string(),
    })
    .optional(),

  // ── Optional nested user object ───────────────────────────────────────
  // Backend returns user_id (NOT id) — unified API contract across all auth endpoints.
  // LoginView, VerifyOTPView, and GoogleAuthView all return user_id as the key.
  user: z
    .object({
      // ✅ user_id — backend sends this as a UUID string (renamed from 'id' to match backend)
      user_id:     z.string().min(1),
      member_id:   z.string().optional().nullable(),
      email:       z.string().optional().nullable(),
      // ✅ phone: Google OAuth users have no phone — backend sends "" or null
      // Accept string | empty string | null | undefined all as valid
      phone:       z.string().nullable().optional().or(z.literal("")),
      // ✅ Allow empty strings for Google users who have no name in profile
      first_name:  z.string().default(""),
      last_name:   z.string().default(""),
      role:        z.string().optional(),
      is_verified: z.boolean(),
      is_staff:    z.boolean().optional().default(false),
      has_vendor_profile: z.boolean().optional().default(false),
      has_client_profile: z.boolean().optional().default(false),
      vendor_profile: ProfileSnapshotSchema,
      client_profile: ProfileSnapshotSchema,
      avatar:      z.string().nullable().optional(),
      date_joined: z.string().optional().nullable(),
    })
    .optional(),
}).transform((data) => {
  // Normalise: if Google response uses tokens.access/refresh, merge to top level
  if (data.tokens?.access && !data.access) {
    return {
      ...data,
      access:  data.tokens.access,
      refresh: data.tokens.refresh,
    };
  }
  return data;
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;


// ── Register ──────────────────────────────────────────────────────────────────
export const RegisterSchema = z
  .object({
    email: z
      .string()
      .email("Invalid email address")
      .optional()
      .or(z.literal("")),
    phone: phoneFieldSchema.optional().or(z.literal("")),
    first_name: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name is too long")
      .regex(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, hyphens or apostrophes"),
    last_name: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name is too long")
      .regex(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, hyphens or apostrophes"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    password_confirm: z.string().min(8, "Please confirm your password"),
    // role is passed as a prop from the route searchParam, not user-editable
    role: z.enum(["vendor", "client"]).optional().default("client"),
  })
  .refine((data) => data.email || data.phone, {
    message: "Either email or phone number is required",
    path: ["email"],
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Passwords do not match",
    path: ["password_confirm"],
  });

export type RegisterPayload = z.infer<typeof RegisterSchema>;

// ── OTP Verification ──────────────────────────────────────────────────────────
export const OTPSchema = z.object({
  otp: z
    .string()
    .min(6, "OTP must be exactly 6 digits")
    .max(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only digits"),
  // Backend verify-otp endpoint accepts { otp, email_or_phone }
  email: z.string().email().optional(),
  phone: phoneFieldSchema.optional(),
});

export type OTPPayload = z.infer<typeof OTPSchema>;

// ── OTP Resend ────────────────────────────────────────────────────────────────
// Backend ResendOTPRequestSerializer expects: { email_or_phone: string }
export const ResendOTPSchema = z.object({
  email_or_phone: z
    .string()
    .min(1, "Email or phone is required")
    .refine(
      (val) => {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        const isPhone = isValidPhoneNumber(val) || /^\+\d{10,15}$/.test(val);
        return isEmail || isPhone;
      },
      "Please enter a valid email address or phone number",
    ),
});

export type ResendOTPPayload = z.infer<typeof ResendOTPSchema>;

// ── Password Reset Request ────────────────────────────────────────────────────
export const PasswordResetRequestSchema = z
  .object({
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: phoneFieldSchema.optional().or(z.literal("")),
  })
  .refine((d) => d.email || d.phone, {
    message: "Email or phone is required",
    path: ["email"],
  });

export type PasswordResetRequestPayload = z.infer<
  typeof PasswordResetRequestSchema
>;

// ── Password Reset Confirm (Email — uidb64 + token from URL) ──────────────────
export const PasswordResetConfirmEmailSchema = z
  .object({
    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    new_password_confirm: z.string().min(8),
    uidb64: z.string().min(1),
    token: z.string().min(1),
  })
  .refine((d) => d.new_password === d.new_password_confirm, {
    message: "Passwords do not match",
    path: ["new_password_confirm"],
  });

export type PasswordResetConfirmEmailPayload = z.infer<
  typeof PasswordResetConfirmEmailSchema
>;

// ── Password Reset Confirm (Phone — OTP only, no phone field) ─────────────────
export const PasswordResetConfirmPhoneSchema = z
  .object({
    otp: z.string().min(4).max(6).regex(/^\d+$/),
    new_password: z
      .string()
      .min(8)
      .regex(/[A-Z]/, "Needs uppercase letter")
      .regex(/[0-9]/, "Needs a number"),
    new_password_confirm: z.string().min(8),
  })
  .refine((d) => d.new_password === d.new_password_confirm, {
    message: "Passwords do not match",
    path: ["new_password_confirm"],
  });

export type PasswordResetConfirmPhonePayload = z.infer<
  typeof PasswordResetConfirmPhoneSchema
>;

// ── Change Password (Authenticated) ───────────────────────────────────────────
export const ChangePasswordSchema = z
  .object({
    old_password: z.string().min(8, "Current password is required"),
    new_password: z
      .string()
      .min(8)
      .regex(/[A-Z]/, "Needs uppercase letter")
      .regex(/[0-9]/, "Needs a number"),
    confirm_password: z.string().min(8),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  })
  .refine((d) => d.old_password !== d.new_password, {
    message: "New password must differ from current password",
    path: ["new_password"],
  });

export type ChangePasswordPayload = z.infer<typeof ChangePasswordSchema>;
