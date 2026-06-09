/**
 * @file badge.tsx
 * @description Fashionistar Badge primitive — Shadcn-compatible API.
 */
import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "destructive" | "warning" | "success";
  size?: "xs" | "sm" | "md" | "lg" | "default";
  color?: "default" | "secondary" | "outline" | "destructive" | "warning" | "success" | string;
}

const variantClasses: Record<string, string> = {
  default:
    "bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(var(--primary))]/90",
  secondary:
    "bg-[hsl(var(--secondary))] text-secondary-foreground hover:bg-[hsl(var(--secondary))]/80",
  outline:
    "border border-border text-foreground bg-transparent",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  warning:
    "bg-amber-500/10 text-amber-500 border border-amber-500/20",
  success:
    "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
};

const sizeClasses = {
  xs: "text-[10px] px-1.5 py-0.25",
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-0.5",
  lg: "text-base px-3 py-1",
  default: "text-xs px-2.5 py-0.5",
};

function Badge({ className, variant, size = "default", color, ...props }: BadgeProps) {
  const activeVariant = variant || (color && variantClasses[color] ? color : "default");
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold transition-colors",
        variantClasses[activeVariant] || variantClasses.default,
        sizeClasses[size] || sizeClasses.default,
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
