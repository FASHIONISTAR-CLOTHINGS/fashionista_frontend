/**
 * @file app/actions/auth.ts
 * @description Stub action placeholders for legacy (auth) pages.
 * These are superseded by @/features/auth — see src/features/auth/
 */

"use server";

export async function login(_prevState: unknown, formData: FormData) {
  // Legacy stub — actual login is handled by /api/auth/[...nextauth]/route.ts
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  // This stub re-directs to the real auth flow
  return { error: "Please use the main login page." };
}

export async function verify(_prevState: unknown, _formData: FormData) {
  // Legacy stub — actual verification is handled by the auth feature
  return { error: "Please use the verification flow." };
}
