/**
 * PhoneInputField — Shared Phone Input with Dynamic Country Selector
 *
 * Enterprise-grade, mobile-first phone input component.
 * - Dynamic country code selector (all countries, flag + dial code)
 * - Nigeria (+234) pre-selected as default
 * - Country list is statically bundled (tree-shaken) — zero runtime HTTP fetches
 * - Strips leading zero and normalises to E.164 before onChange fires
 * - Accessible: aria-label, proper grouping for screen readers
 *
 * Used across: RegisterForm, LoginForm, PasswordResetForm, ResendOTP
 */
"use client";

import { useState, useCallback, useId } from "react";
import { ChevronDown, Phone } from "lucide-react";
import {
  getCountries,
  getCountryCallingCode,
} from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";
import { normalisePhone } from "@/lib/phone/normalise";

// Pre-build the country list once at module scope for performance
// This is statically evaluated at build time — no runtime cost
const COUNTRY_LIST = getCountries().map((country) => ({
  code: country,
  dialCode: `+${getCountryCallingCode(country)}`,
}));

// Country display name map (cached singleton)
const displayNames =
  typeof Intl !== "undefined" && Intl.DisplayNames
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

function getCountryName(code: string): string {
  try {
    return displayNames?.of(code) ?? code;
  } catch {
    return code;
  }
}

// Country flag emoji from ISO code
function getFlagEmoji(countryCode: string): string {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt(0)),
    );
}

interface PhoneInputFieldProps {
  /** Called with the E.164 normalised value on every change */
  onChange: (e164Value: string) => void;
  /** Called when the field is blurred */
  onBlur?: () => void;
  value?: string;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Default country — Nigeria by default */
  defaultCountry?: CountryCode;
  /** Error message to display below the field */
  error?: string;
  /** Additional className for the wrapper */
  wrapperClassName?: string;
}

export function PhoneInputField({
  onChange,
  onBlur,
  value = "",
  id,
  placeholder = "8012345678",
  disabled = false,
  className = "",
  defaultCountry = "NG",
  error,
  wrapperClassName = "",
}: PhoneInputFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const [selectedCountry, setSelectedCountry] =
    useState<CountryCode>(defaultCountry);
  const [isOpen, setIsOpen] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [searchQuery, setSearchQuery] = useState("");

  const dialCode = `+${getCountryCallingCode(selectedCountry)}`;

  const handleCountryChange = useCallback(
    (country: CountryCode) => {
      setSelectedCountry(country);
      setIsOpen(false);
      setSearchQuery("");
      // Re-normalise current value with new dial code
      if (localValue) {
        const newDialCode = `+${getCountryCallingCode(country)}`;
        const normalised = normalisePhone(localValue, newDialCode);
        onChange(normalised);
      }
    },
    [localValue, onChange],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setLocalValue(raw);
      // Normalise to E.164 and fire onChange
      const normalised = normalisePhone(raw, dialCode);
      onChange(normalised);
    },
    [dialCode, onChange],
  );

  const filteredCountries = COUNTRY_LIST.filter((c) => {
    if (!searchQuery) return true;
    const name = getCountryName(c.code).toLowerCase();
    return (
      name.includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dialCode.includes(searchQuery)
    );
  });

  return (
    <div className={`space-y-1 ${wrapperClassName}`} suppressHydrationWarning>
      <div
        className={`flex rounded-lg border ${
          error ? "border-destructive" : "border-input"
        } overflow-visible relative focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0 transition-all`}
        suppressHydrationWarning
      >
        {/* Country Selector Trigger */}
        <button
          type="button"
          aria-label={`Phone country code: ${getCountryName(selectedCountry)} ${dialCode}`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            flex items-center gap-1 px-3 py-2.5 border-r border-input bg-muted/50
            rounded-l-lg text-sm font-medium hover:bg-muted transition-colors
            min-w-[5.5rem] shrink-0 cursor-pointer
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <span
            className="text-base leading-none"
            aria-hidden="true"
            suppressHydrationWarning
          >
            {getFlagEmoji(selectedCountry)}
          </span>
          <span className="font-mono text-xs text-foreground/90 tracking-tight">
            {dialCode}
          </span>
          <ChevronDown
            className={`h-3 w-3 text-muted-foreground transition-transform duration-150 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Phone Number Input */}
        <div className="relative flex-1">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            id={inputId}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder={placeholder}
            value={localValue}
            onChange={handleInputChange}
            onBlur={onBlur}
            disabled={disabled}
            className={`
              w-full pl-9 pr-4 py-2.5 bg-background text-sm text-foreground
              rounded-r-lg focus:outline-none
              placeholder:text-muted-foreground/60
              disabled:opacity-50 disabled:cursor-not-allowed
              ${className}
            `}
          />
        </div>

        {/* Country Dropdown */}
        {isOpen && (
          <div
            className="
              absolute left-0 top-full mt-1 z-50
              w-72 max-h-64 overflow-y-auto
              bg-popover border border-border rounded-xl shadow-elevated
              animate-in fade-in-0 zoom-in-95 duration-150
            "
            role="listbox"
            aria-label="Select country code"
          >
            {/* Search */}
            <div className="sticky top-0 bg-popover border-b border-border px-3 py-2">
              <input
                type="text"
                placeholder="Search country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-muted/50 text-sm px-3 py-1.5 rounded-md outline-none focus:ring-1 focus:ring-ring"
                autoFocus
              />
            </div>
            {/* Country Options */}
            {filteredCountries.map((country) => (
              <button
                key={country.code}
                type="button"
                role="option"
                aria-selected={selectedCountry === country.code}
                onClick={() =>
                  handleCountryChange(country.code as CountryCode)
                }
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left
                  hover:bg-muted transition-colors
                  ${selectedCountry === country.code ? "bg-primary/10 text-primary font-medium" : "text-foreground"}
                `}
              >
                <span className="text-base" suppressHydrationWarning>
                  {getFlagEmoji(country.code)}
                </span>
                <span className="font-mono text-xs w-12 shrink-0 text-muted-foreground">
                  {country.dialCode}
                </span>
                <span className="truncate">{getCountryName(country.code)}</span>
              </button>
            ))}
            {filteredCountries.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                No countries found
              </p>
            )}
          </div>
        )}
      </div>

      {/* Click outside handler */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Error message */}
      {error && (
        <p className="text-xs text-destructive mt-0.5" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
