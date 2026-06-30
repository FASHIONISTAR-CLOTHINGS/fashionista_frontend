/**
 * Phone normalisation utilities — Fashionistar
 *
 * Industry-standard approach (used by Stripe, Twilio, Google, Airbnb):
 *  1. Strip all non-digit characters
 *  2. If the local number starts with '0' (Nigerian convention), strip that leading 0
 *  3. Prepend the chosen dial code to produce a valid E.164 string
 *
 * Example:
 *   normalisePhone("09048123456", "+234")  →  "+2349048123456"
 *   normalisePhone("9048123456",  "+234")  →  "+2349048123456"
 *   normalisePhone("+2349048123456", "+234") → "+2349048123456" (already E.164)
 */
import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";

/**
 * Strips non-digits, removes leading zero, prepends dialCode.
 * Safe to call with any partial / complete input.
 */
export function normalisePhone(
  raw: string,
  dialCode = "+234",
): string {
  if (!raw) return "";

  // If already a complete E.164 number (starts with +), return as-is
  const trimmed = raw.trim();
  if (trimmed.startsWith("+")) return trimmed;

  // Strip everything that isn't a digit
  const digits = trimmed.replace(/\D/g, "");

  // Strip leading zero (e.g. 09048… → 9048…)
  const localPart = digits.startsWith("0") ? digits.slice(1) : digits;

  return `${dialCode}${localPart}`;
}

/**
 * Validates that a phone number is valid for a given country.
 * Uses libphonenumber-js — same engine used by Google's libphonenumber C++ lib.
 *
 * @param phone  E.164 string (e.g. "+2349048123456")
 * @param country ISO 3166-1 alpha-2 country code (e.g. "NG")
 */
export function isValidPhone(
  phone: string,
  country?: CountryCode,
): boolean {
  try {
    return isValidPhoneNumber(phone, country);
  } catch {
    return false;
  }
}

/**
 * Returns the national number (digits only, no country code) from an E.164 string.
 * Used to populate the input field when editing an existing number.
 *
 * Example: "+2349048123456" → "09048123456" (with leading 0 for display)
 */
export function toNationalDisplay(e164: string, country: CountryCode = "NG"): string {
  try {
    const parsed = parsePhoneNumber(e164, country);
    return parsed.formatNational().replace(/\D/g, ""); // digits only for the input
  } catch {
    return e164.replace(/^\+\d{1,3}/, ""); // fallback: strip dial code
  }
}
