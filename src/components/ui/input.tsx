/**
 * @file input.tsx
 * @description Fashionistar Input primitive — Shadcn-compatible API.
 * Styled to match the dark glassmorphism design system.
 */
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white",
          "placeholder:text-white/30 outline-none",
          "focus:border-[hsl(var(--accent))] focus:ring-1 focus:ring-[hsl(var(--accent))]/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-colors duration-150",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
