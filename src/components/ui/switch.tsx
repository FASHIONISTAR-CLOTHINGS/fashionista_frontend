/**
 * @file switch.tsx
 * @description Fashionistar Switch primitive — Shadcn-compatible API.
 */
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <label className={cn("relative inline-flex cursor-pointer items-center", className)}>
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className="sr-only peer"
          {...props}
        />
        <div
          className={cn(
            "relative h-5 w-9 rounded-full bg-white/10 border border-white/10 transition-colors",
            "peer-checked:bg-[hsl(var(--accent))] peer-checked:border-[hsl(var(--accent))]",
            "after:absolute after:top-0.5 after:left-[2px]",
            "after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all",
            "peer-checked:after:translate-x-4",
          )}
        />
      </label>
    );
  },
);
Switch.displayName = "Switch";

export { Switch };
