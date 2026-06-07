import { getCountries, getCountryCallingCode } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";
import type { CountryOption } from "../types";
import { flagEmoji } from "../lib/normalizers";

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

export const COUNTRIES: CountryOption[] = getCountries()
  .map((country) => ({
    id: country,
    code: country,
    name: getCountryName(country),
    flag: flagEmoji(country),
    phone_code: `+${getCountryCallingCode(country as CountryCode)}`,
    is_active: true,
  }))
  .sort((a, b) => {
    if (a.code === "NG") return -1;
    if (b.code === "NG") return 1;
    return a.name.localeCompare(b.name);
  });

export function getCountryOption(countryCode: string): CountryOption | undefined {
  return COUNTRIES.find((country) => country.code === countryCode.toUpperCase());
}

