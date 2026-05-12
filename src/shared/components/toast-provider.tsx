"use client";

/**
 * @module GlobalToastProvider
 *
 * Drop this once in `app/layout.tsx` inside the body.
 * All feature code can then call `useToast()` anywhere
 * without managing Sonner's <Toaster> placement.
 *
 * Usage in layout.tsx:
 *   import { GlobalToastProvider } from "@/shared";
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
      duration={4000}
      toastOptions={{
        classNames: {
          toast:
            "group font-sans text-sm rounded-xl border border-border shadow-lg backdrop-blur-sm",
          title: "font-semibold text-foreground",
          description: "text-muted-foreground",
          actionButton:
            "bg-primary text-primary-foreground text-xs font-medium rounded-md px-3 py-1",
          cancelButton:
            "bg-muted text-muted-foreground text-xs font-medium rounded-md px-3 py-1",
          closeButton:
            "text-muted-foreground hover:text-foreground transition-colors",
        },
      }}
    />
  );
}
