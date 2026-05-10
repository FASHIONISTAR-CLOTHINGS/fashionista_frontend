/**
 * cn — Class Name Utility
 *
 * Combines clsx (conditional classes) with tailwind-merge (deduplication).
 * Standard pattern used by all Shadcn/ui components.
 *
 * Usage:
 *   cn("px-4 py-2", isActive && "bg-primary", "px-6") → "py-2 bg-primary px-6"
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * formatCurrency — Format a number as Nigerian Naira (₦)
 */
export function formatCurrency(
  amount: number,
  currency: string = "NGN",
  locale: string = "en-NG",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * formatDate — Format a date string or Date object
 */
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  },
): string {
  return new Intl.DateTimeFormat("en-NG", options).format(
    typeof date === "string" ? new Date(date) : date,
  );
}

/**
 * truncateText — Truncate text to a given character limit
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "…";
}

/**
 * slug — Convert a string to URL-safe slug
 */
export function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * sleep — Async delay utility for testing and rate limiting
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
