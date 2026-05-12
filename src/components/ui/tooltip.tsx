/**
 * @file tooltip.tsx
 * @description Fashionistar Tooltip primitive — Shadcn-compatible API.
 * Uses CSS-only hover tooltip (no Radix UI dependency).
 */
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ── Provider ───────────────────────────────────────────────────────────────────
// Shadcn requires a TooltipProvider at the tree root — no-op here since we use CSS.

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// ── Tooltip root ──────────────────────────────────────────────────────────────

export function Tooltip({ children }: { children: React.ReactNode }) {
  return <div className="relative inline-flex">{children}</div>;
}

// ── TooltipTrigger ────────────────────────────────────────────────────────────

export const TooltipTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, asChild: _asChild, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn("peer", className)}
    {...props}
  />
));
TooltipTrigger.displayName = "TooltipTrigger";

// ── TooltipContent ────────────────────────────────────────────────────────────

export const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { side?: "top" | "bottom" | "left" | "right" }
>(({ className, side = "top", ...props }, ref) => (
  <div
    ref={ref}
    role="tooltip"
    className={cn(
      "absolute z-50 rounded-lg bg-zinc-900 border border-white/10 px-3 py-1.5 text-xs text-white shadow-xl",
      "opacity-0 pointer-events-none transition-opacity duration-150",
      "peer-hover:opacity-100 peer-focus-visible:opacity-100",
      {
        "bottom-full mb-2 left-1/2 -translate-x-1/2": side === "top",
        "top-full mt-2 left-1/2 -translate-x-1/2": side === "bottom",
        "right-full mr-2 top-1/2 -translate-y-1/2": side === "left",
        "left-full ml-2 top-1/2 -translate-y-1/2": side === "right",
      },
      className,
    )}
    {...props}
  />
));
TooltipContent.displayName = "TooltipContent";
