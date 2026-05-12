const NON_CODE_CHARS = /[^a-z0-9]+/g;
const MULTI_SPACES = /\s+/g;

const STATE_CODE_OVERRIDES: Record<string, string> = {
  "FEDERAL CAPITAL TERRITORY": "FCT",
  FCT: "FCT",
};

export function compactText(value: unknown): string {
  return String(value ?? "").trim().replace(MULTI_SPACES, " ");
}

export function codeSlug(value: unknown): string {
  return compactText(value).toLowerCase().replace(NON_CODE_CHARS, "-").replace(/^-|-$/g, "").toUpperCase();
}

export function stateCode(name: string): string {
  const normalized = compactText(name).toUpperCase();
  return STATE_CODE_OVERRIDES[normalized] ?? codeSlug(name);
}

export function flagEmoji(countryCode: string): string {
  const code = compactText(countryCode).toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "";
  return [...code].map((char) => String.fromCodePoint(127397 + char.charCodeAt(0))).join("");
}

