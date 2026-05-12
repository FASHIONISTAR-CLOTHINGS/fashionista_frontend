/**
 * parseApiError — Rich API Error Parser
 *
 * Extracts human-readable error messages from Django REST Framework / Django Ninja
 * error responses. Supports:
 *  - { detail: string }                     — standard DRF 401/403/404
 *  - { non_field_errors: string[] }         — DRF validation non-field errors
 *  - { otp: string[] }                      — OTP-specific errors
 *  - { email: string[] }                    — field-specific errors
 *  - { phone: string[] }                    — field-specific errors
 *  - { message: string }                    — custom backend messages
 *  - { error: string }                      — legacy error format
 *  - Nested objects / arrays of strings
 *
 * Also parses URLs within messages so they can be rendered as clickable links.
 */
import { isAxiosError } from "axios";

export interface ParsedApiError {
  /** Primary human-readable error message */
  message: string;
  /** Any URLs found within the message, extracted for click-ability */
  links: Array<{ text: string; href: string }>;
  /** Field-specific errors, keyed by field name */
  fieldErrors: Record<string, string>;
  /** Whether this is a network/connectivity error */
  isNetworkError: boolean;
}

// URL regex — matches /api/v1/... internal paths and full https:// URLs
const URL_REGEX = /(https?:\/\/[^\s,]+|\/[a-zA-Z0-9/_-]+\/)/g;

// Relative paths that map to app routes (for clickable internal links)
const INTERNAL_PATH_MAP: Record<string, string> = {
  "/auth/resend-otp/": "/auth/verify-otp",
  "/auth/login/": "/auth/sign-in",
  "/auth/register/": "/auth/choose-role",
  "/auth/forgot-password/": "/auth/forgot-password",
};

function extractLinks(text: string): Array<{ text: string; href: string }> {
  const links: Array<{ text: string; href: string }> = [];
  const matches = text.match(URL_REGEX) ?? [];

  for (const match of matches) {
    // Map internal API paths to frontend routes
    const href = INTERNAL_PATH_MAP[match] ?? match;
    links.push({ text: match, href });
  }

  return links;
}

function stringifyValue(val: unknown): string {
  if (typeof val === "string") return val;
  if (Array.isArray(val)) {
    const strings = val.filter((v) => typeof v === "string");
    return strings.join(" ");
  }
  return "";
}

function extractFromData(data: Record<string, unknown>): {
  message: string;
  fieldErrors: Record<string, string>;
} {
  const fieldErrors: Record<string, string> = {};

  // ── Fashionistar Envelope Error Format ─────────────────────────────────────
  // Backend returns: { success: false, message: "Validation failed.", code: "...",
  //                    errors: { email: ["already in use"], detail: "...", ... } }
  // We surface `message` for the top-level banner and spread `errors` for field-level highlights.
  const envelopeErrors =
    data.errors && typeof data.errors === "object" && !Array.isArray(data.errors)
      ? (data.errors as Record<string, unknown>)
      : null;

  if (envelopeErrors) {
    // Field-level errors inside the `errors` object
    for (const [key, val] of Object.entries(envelopeErrors)) {
      const str = stringifyValue(val as unknown);
      if (str) fieldErrors[key] = str;
    }
    // Top-level message is always the human-readable summary
    if (typeof data.message === "string" && data.message) {
      return { message: data.message, fieldErrors };
    }
    // Fallback to first field error or detail inside errors
    const firstFieldMsg = Object.values(fieldErrors)[0] ?? "";
    return { message: firstFieldMsg || "Something went wrong. Please try again.", fieldErrors };
  }

  // Priority order: detail → non_field_errors → message → error → first field error
  if (typeof data.detail === "string") {
    return { message: data.detail, fieldErrors };
  }

  if (Array.isArray(data.non_field_errors)) {
    return { message: stringifyValue(data.non_field_errors), fieldErrors };
  }

  if (typeof data.message === "string") {
    return { message: data.message, fieldErrors };
  }

  if (typeof data.error === "string") {
    return { message: data.error, fieldErrors };
  }

  // Collect field-specific errors
  let firstFieldMessage = "";
  for (const [key, val] of Object.entries(data)) {
    if (key === "status_code") continue;
    const str = stringifyValue(val as unknown);
    if (str) {
      if (!firstFieldMessage) firstFieldMessage = str;
      fieldErrors[key] = str;
    }
  }

  return {
    message: firstFieldMessage || "Something went wrong. Please try again.",
    fieldErrors,
  };
}

/**
 * Primary export — call this in every onError handler.
 *
 * @example
 * onError: (error) => {
 *   const parsed = parseApiError(error);
 *   toast.error("Failed", { description: parsed.message });
 * }
 */
export function parseApiError(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): ParsedApiError {
  // Network / no response
  if (isAxiosError(error)) {
    if (!error.response) {
      return {
        message:
          "Network error — please check your connection and try again.",
        links: [],
        fieldErrors: {},
        isNetworkError: true,
      };
    }

    const data = error.response?.data as Record<string, unknown> | undefined;

    if (!data || typeof data !== "object") {
      return {
        message: fallback,
        links: [],
        fieldErrors: {},
        isNetworkError: false,
      };
    }

    const { message, fieldErrors } = extractFromData(data);
    const links = extractLinks(message);

    return { message, links, fieldErrors, isNetworkError: false };
  }

  // Non-axios error
  if (error instanceof Error) {
    return {
      message: error.message || fallback,
      links: [],
      fieldErrors: {},
      isNetworkError: false,
    };
  }

  return {
    message: fallback,
    links: [],
    fieldErrors: {},
    isNetworkError: false,
  };
}

/**
 * Simple string-only extraction for legacy onError handlers.
 * Use parseApiError() for rich display.
 */
export function extractApiError(error: unknown, fallback?: string): string {
  return parseApiError(error, fallback).message;
}
