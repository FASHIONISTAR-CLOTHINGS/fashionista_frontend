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
          "flex h-10 w-full rounded-xl border border-[#D9D9D9] bg-white px-3 py-2 text-sm text-[#1A1208]",
          "placeholder:text-zinc-400 outline-none",
          "focus:border-[#01454A] focus:ring-2 focus:ring-[#01454A]/15",
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
