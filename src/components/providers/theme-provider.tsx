"use client";
/**
 * Theme Provider — Dark/Light Mode using next-themes
 *
 * Wraps the app to support system-aware and user-toggled themes.
 * Reads class from <html> element (configured in tailwind.config.ts darkMode: 'class').
 */
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}
