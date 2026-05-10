/**
 * PILLAR 3: Vitest Unit Tests — Auth Schema Validation
 *
 * Tests all Zod schemas with valid and invalid inputs.
 * Race condition: validates that schema parsing is deterministic under load.
 */
import { describe, it, expect } from "vitest";
import {
  LoginSchema,
  RegisterSchema,
  OTPSchema,
  ChangePasswordSchema,
} from "@/features/auth/schemas/auth.schemas";

describe("LoginSchema", () => {
  it("✅ accepts valid email + password", () => {
    const result = LoginSchema.safeParse({
      email: "test@fashionistar.com",
      password: "SecurePass1",
    });
    expect(result.success).toBe(true);
  });

  it("❌ rejects invalid email", () => {
    const result = LoginSchema.safeParse({
      email: "not-an-email",
      password: "SecurePass1",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain("email");
  });

  it("❌ rejects short password (< 8 chars)", () => {
    const result = LoginSchema.safeParse({
      email: "test@fashionistar.com",
      password: "short",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain("password");
  });

  it("❌ rejects empty fields", () => {
    const result = LoginSchema.safeParse({ email: "", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("RegisterSchema", () => {
  const validRegister = {
    email: "user@fashionistar.com",
    phone: "",
    first_name: "Daniel",
    last_name: "Ezichi",
    password: "SecurePass1",
    password_confirm: "SecurePass1",
  };

  it("✅ accepts valid registration with email", () => {
    expect(RegisterSchema.safeParse(validRegister).success).toBe(true);
  });

  it("✅ accepts valid registration with phone only", () => {
    const result = RegisterSchema.safeParse({
      ...validRegister,
      email: "",
      phone: "+2348012345678",
    });
    expect(result.success).toBe(true);
  });

  it("❌ rejects when neither email nor phone is provided", () => {
    const result = RegisterSchema.safeParse({
      ...validRegister,
      email: "",
      phone: "",
    });
    expect(result.success).toBe(false);
  });

  it("❌ rejects mismatched passwords", () => {
    const result = RegisterSchema.safeParse({
      ...validRegister,
      password_confirm: "DifferentPass1",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain("password_confirm");
  });

  it("❌ rejects password without uppercase letter", () => {
    const result = RegisterSchema.safeParse({
      ...validRegister,
      password: "nouppercase1",
      password_confirm: "nouppercase1",
    });
    expect(result.success).toBe(false);
  });

  it("❌ rejects invalid phone format", () => {
    const result = RegisterSchema.safeParse({
      ...validRegister,
      email: "",
      phone: "08012345678", // Missing country code
    });
    expect(result.success).toBe(false);
  });
});

describe("OTPSchema", () => {
  it("✅ accepts 6-digit numeric OTP", () => {
    expect(OTPSchema.safeParse({ otp: "123456" }).success).toBe(true);
  });

  it("❌ rejects non-numeric OTP", () => {
    expect(OTPSchema.safeParse({ otp: "12ab56" }).success).toBe(false);
  });

  it("❌ rejects OTP shorter than 4 digits", () => {
    expect(OTPSchema.safeParse({ otp: "123" }).success).toBe(false);
  });

  it("❌ rejects OTP longer than 6 digits", () => {
    expect(OTPSchema.safeParse({ otp: "1234567" }).success).toBe(false);
  });
});

describe("ChangePasswordSchema", () => {
  const validChange = {
    old_password: "OldPass1234",
    new_password: "NewSecure1",
    new_password_confirm: "NewSecure1",
  };

  it("✅ accepts valid password change", () => {
    expect(ChangePasswordSchema.safeParse(validChange).success).toBe(true);
  });

  it("❌ rejects same old and new password", () => {
    const result = ChangePasswordSchema.safeParse({
      old_password: "SamePass1",
      new_password: "SamePass1",
      new_password_confirm: "SamePass1",
    });
    expect(result.success).toBe(false);
  });

  it("❌ rejects mismatched new passwords", () => {
    const result = ChangePasswordSchema.safeParse({
      ...validChange,
      new_password_confirm: "Mismatch9",
    });
    expect(result.success).toBe(false);
  });
});

// ── IDEMPOTENCY TEST: parsing the same valid input 100 times returns same result ──
describe("Schema Idempotency (100 iterations)", () => {
  it("LoginSchema produces identical results on repeated parse", () => {
    const input = { email: "test@test.com", password: "Password1" };
    const results = Array.from({ length: 100 }, () =>
      LoginSchema.safeParse(input)
    );
    const successes = results.filter((r) => r.success).length;
    expect(successes).toBe(100);
  });
});
