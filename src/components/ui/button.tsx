"use client";

/**
 * @file Button.tsx
 * @description Production-grade, CVA-powered Button component.
 *
 * Variants:   default | ghost | outline | secondary | destructive | link
 * Sizes:      sm | md (default) | lg | icon
 *
 * Compatible with all React button props + className overrides.
 * Replaces the legacy Button.tsx (which only accepted a title string).
 */



import React from "react";

import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";



// ─────────────────────────────────────────────────────────────────────────────
// VARIANT STYLES (hand-rolled CVA equivalent — no extra dep required)
// ─────────────────────────────────────────────────────────────────────────────

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg " +
  "text-sm font-medium transition-all duration-200 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]";

  
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
  // Glassmorphic variants
  primary:
    "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-amber-500/25 border border-amber-400/30",
  danger:
    "bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 hover:border-red-500/50",
  success:
    "bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30",
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
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}



export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      type = "button",
      isLoading,
      leftIcon,
      rightIcon,
      asChild = false,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(base, variants[variant] ?? variants.default, sizes[size] ?? sizes.md, className)}
        {...props}
      >
        {asChild ? children : (
          <>
            {isLoading ? (
              <svg className="animate-spin w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : leftIcon ? (
              <span className="flex-shrink-0">{leftIcon}</span>
            ) : null}
            {children}
            {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </Comp>
    );
  },
);

Button.displayName = "Button";

export default Button;