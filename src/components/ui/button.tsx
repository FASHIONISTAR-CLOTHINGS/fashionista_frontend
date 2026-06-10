"use client";

/**
 * @file button.tsx
 * @description Production-grade, CVA-powered Button component.
 *
 * Variants:   default | ghost | outline | secondary | destructive | link
 * Sizes:      sm | md (default) | lg | icon
 *
 * Compatible with all React button props + className overrides.
 * Replaces the legacy primitives/Button.tsx (which only accepted a title string).
 */

import React from "react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT STYLES (hand-rolled CVA equivalent — no extra dep required)
// ─────────────────────────────────────────────────────────────────────────────

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg " +
  "text-sm font-medium transition-all duration-200 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-50 select-none";

const variants: Record<string, string> = {
  default:
    "bg-[#FDA600] text-white shadow hover:bg-[#e09500] focus-visible:ring-[#FDA600]",
  ghost:
    "bg-transparent text-current hover:bg-black/5 dark:hover:bg-white/10",
  outline:
    "border border-current bg-transparent hover:bg-black/5 dark:hover:bg-white/10",
  secondary:
    "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
  link: "underline-offset-4 hover:underline p-0 h-auto font-normal",
};

const sizes: Record<string, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 py-2",
  lg: "h-12 px-8 text-base",
  icon: "h-10 w-10 p-0",
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  asChild?: boolean; // reserved for future Radix Slot compatibility
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      type = "button",
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(base, variants[variant] ?? variants.default, sizes[size] ?? sizes.md, className)}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
