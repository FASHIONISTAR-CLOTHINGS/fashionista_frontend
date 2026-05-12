import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Type-safe environment variable validation.
 * This file is the SINGLE SOURCE OF TRUTH for all env vars.
 * If a required variable is missing, the app will FAIL TO START — not crash at runtime.
 *
 * @see https://env.t3.gg/docs/nextjs
 */
export const env = createEnv({
  // ── Server-Side Variables (NOT exposed to browser) ──────────────────────
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    CLOUDINARY_API_SECRET: z.string().min(1),
    CLOUDINARY_API_KEY: z.string().min(1),
    NEXTAUTH_SECRET: z
      .string()
      .min(32, "NEXTAUTH_SECRET must be at least 32 chars"),
    JWT_SECRET: z.string().min(1),
    STRIPE_SECRET_KEY: z.string().startsWith("sk_").optional(),
    SENTRY_AUTH_TOKEN: z.string().optional(),
  },

  // ── Client-Side Variables (prefixed NEXT_PUBLIC_) ────────────────────────
  client: {
    NEXT_PUBLIC_APP_NAME: z.string().default("FASHIONISTAR AI"),
    NEXT_PUBLIC_VERSION: z.string().default("2.0.0"),
    NEXT_PUBLIC_ENV: z
      .enum(["development", "test", "staging", "production"])
      .default("development"),

    // Backend API
    NEXT_PUBLIC_API_V1_URL: z
      .string()
      .url("NEXT_PUBLIC_API_V1_URL must be a valid URL"),
    NEXT_PUBLIC_API_V2_URL: z
      .string()
      .url("NEXT_PUBLIC_API_V2_URL must be a valid URL"),
    NEXT_PUBLIC_BACKEND_URL: z
      .string()
      .url("NEXT_PUBLIC_BACKEND_URL must be a valid URL"),

    // Frontend
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_FRONTEND_TUNNEL_URL: z.string().url().optional(),

    // Cloudinary
    NEXT_PUBLIC_CLOUDINARY_CLOUD: z.string().min(1),
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: z.string().min(1),

    // Monitoring
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),

    // Payments
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_").optional(),

    // Feature Flags
    NEXT_PUBLIC_FEATURE_AI_MEASUREMENTS: z
      .string()
      .transform((v) => v === "true")
      .default("false"),
    NEXT_PUBLIC_FEATURE_SOCIAL_LOGIN: z
      .string()
      .transform((v) => v === "true")
      .default("false"),
    NEXT_PUBLIC_FEATURE_BETA_CHECKOUT: z
      .string()
      .transform((v) => v === "true")
      .default("false"),
  },

  // ── Runtime Env Mapping ───────────────────────────────────────────────────
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    JWT_SECRET: process.env.JWT_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,

    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_VERSION: process.env.NEXT_PUBLIC_VERSION,
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
    NEXT_PUBLIC_API_V1_URL: process.env.NEXT_PUBLIC_API_V1_URL,
    NEXT_PUBLIC_API_V2_URL: process.env.NEXT_PUBLIC_API_V2_URL,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_FRONTEND_TUNNEL_URL:
      process.env.NEXT_PUBLIC_FRONTEND_TUNNEL_URL,
    NEXT_PUBLIC_CLOUDINARY_CLOUD: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD,
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET:
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_FEATURE_AI_MEASUREMENTS:
      process.env.NEXT_PUBLIC_FEATURE_AI_MEASUREMENTS,
    NEXT_PUBLIC_FEATURE_SOCIAL_LOGIN:
      process.env.NEXT_PUBLIC_FEATURE_SOCIAL_LOGIN,
    NEXT_PUBLIC_FEATURE_BETA_CHECKOUT:
      process.env.NEXT_PUBLIC_FEATURE_BETA_CHECKOUT,
  },

  // ── Options ───────────────────────────────────────────────────────────────
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION || process.env.NODE_ENV === "test",
});
