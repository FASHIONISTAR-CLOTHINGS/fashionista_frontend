"use client";
/**
 * @module GlobalToastProvider
 *
 * Drop this ONCE in `app/layout.tsx` inside the body.
 * All feature code can then call `useToast()` or `toast` from sonner anywhere
 * without managing Sonner's <Toaster> placement.
 *
 * Singleton guarantee:
 *  - Only ONE <Toaster> is mounted (in RootLayout)
 *  - visibleToasts={5} prevents stack-pileup during rapid async operations
 *  - richColors surfaces success/warning/error with Fashionistar brand tokens
 *  - expand={false} keeps the stack compact
 *
 * Usage in layout.tsx:
 *   import { GlobalToastProvider } from "@/components";
 *   export default function RootLayout({ children }) {
 *     return (
 *       <html>
 *         <body>
 *           {children}
 *           <GlobalToastProvider />
 *         </body>
 *       </html>
 *     );
 *   }
 */

import { Toaster } from "sonner";

export function GlobalToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      expand={false}
      duration={4500}
      visibleToasts={5}
      toastOptions={{
        classNames: {
          toast:
            "group font-sans text-sm rounded-xl border border-border shadow-lg backdrop-blur-sm",
          title: "font-semibold text-foreground",
          description: "text-muted-foreground text-xs leading-relaxed",
          actionButton:
            "bg-primary text-primary-foreground text-xs font-medium rounded-md px-3 py-1",
          cancelButton:
            "bg-muted text-muted-foreground text-xs font-medium rounded-md px-3 py-1",
          closeButton:
            "text-muted-foreground hover:text-foreground transition-colors",
          error:
            "!border-destructive/30 !bg-destructive/5",
          success:
            "!border-green-500/30 !bg-green-500/5",
          warning:
            "!border-amber-500/30 !bg-amber-500/5",
          info:
            "!border-blue-500/30 !bg-blue-500/5",
        },
      }}
    />
  );
}
