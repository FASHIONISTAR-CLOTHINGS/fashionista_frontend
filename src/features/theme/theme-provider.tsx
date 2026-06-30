"use client";
/**
 * features/theme/theme-provider.tsx
 *
 * ARCHITECTURE NOTE:
 * The root Providers stack (src/components/providers/index.tsx) already mounts
 * next-themes' NextThemesProvider. That provider IS the source of truth for the
 * HTML class toggle and localStorage key "theme".
 *
 * This file is a THIN WRAPPER over next-themes that:
 *   1. Exposes the same `useTheme()` API that all feature components expect
 *   2. Adds `switchTheme()` (toggle helper) and a typed `resolvedTheme`
 *   3. Re-exports `ThemeProvider` as a no-op passthrough so any legacy
 *      `<ThemeProvider>` wrapping in feature files compiles without errors.
 *
 * Why this approach?
 *   The old custom ThemeProvider created its OWN React context that was never
 *   mounted in the providers stack, causing the runtime error:
 *     "useTheme must be used within ThemeProvider"
 *   By delegating to next-themes here we avoid a second conflicting theme
 *   manager while keeping every call-site's import path unchanged.
 */

import { useTheme as useNextTheme } from "next-themes";
import { useCallback, type PropsWithChildren } from "react";

export type FashionistarTheme = "light" | "dark" | "system";

// ── Exported hook (drop-in replacement, same shape as before) ─────────────────

export interface ThemeContextValue {
  theme: FashionistarTheme | string;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: FashionistarTheme | string) => void;
  switchTheme: () => void;
}

export function useTheme(): ThemeContextValue {
  const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme();

  const switchTheme = useCallback(() => {
    const resolved = resolvedTheme ?? systemTheme ?? "light";
    setTheme(resolved === "dark" ? "light" : "dark");
  }, [resolvedTheme, systemTheme, setTheme]);

  return {
    theme: theme ?? "system",
    resolvedTheme: ((resolvedTheme ?? "light") as "light" | "dark"),
    setTheme,
    switchTheme,
  };
}

// ── No-op passthrough ThemeProvider (keeps legacy imports compiling) ──────────
// Any feature file that does <ThemeProvider>{children}</ThemeProvider> will
// simply render children — the actual provider is already in the root stack.

export function ThemeProvider({ children }: PropsWithChildren) {
  return <>{children}</>;
}
