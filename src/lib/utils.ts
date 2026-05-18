import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  value: number | string | null | undefined,
  currency = "NGN",
  locale = "en-NG",
) {
  const amount =
    typeof value === "string" ? Number.parseFloat(value) : (value ?? 0)

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0)
}

export function formatDate(
  value: string | number | Date | null | undefined,
  locale = "en-NG",
) {
  if (!value) return ""
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ""

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

export function truncateText(value: string, maxLength = 100) {
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength).trimEnd()}…`
}

export function slug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}
