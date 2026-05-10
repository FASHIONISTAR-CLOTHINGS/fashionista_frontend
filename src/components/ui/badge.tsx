/**
 * @file badge.tsx
 * @description Fashionistar Badge primitive — Shadcn-compatible API.
 */
import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "destructive";
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default:
    "bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(var(--primary))]/90",
  secondary:
    "bg-[hsl(var(--secondary))] text-secondary-foreground hover:bg-[hsl(var(--secondary))]/80",
  outline:
    "border border-border text-foreground bg-transparent",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
