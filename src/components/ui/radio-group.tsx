/**
 * @file radio-group.tsx
 * @description Fashionistar RadioGroup primitive — Shadcn-compatible API.
 */
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ── RadioGroup ─────────────────────────────────────────────────────────────────

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
}

const RadioGroupContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
}>({});

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, defaultValue, children, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
    const controlled = value !== undefined;
    const currentValue = controlled ? value : internalValue;

    const handleChange = React.useCallback(
      (v: string) => {
        if (!controlled) setInternalValue(v);
        onValueChange?.(v);
      },
      [controlled, onValueChange],
    );

    return (
      <RadioGroupContext.Provider value={{ value: currentValue, onValueChange: handleChange }}>
        <div
          ref={ref}
          role="radiogroup"
          className={cn("flex flex-col gap-2", className)}
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  },
);
RadioGroup.displayName = "RadioGroup";

// ── RadioGroupItem ────────────────────────────────────────────────────────────

interface RadioGroupItemProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  value: string;
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, id, ...props }, ref) => {
    const ctx = React.useContext(RadioGroupContext);
    const isChecked = ctx.value === value;

    return (
      <input
        type="radio"
        ref={ref}
        id={id}
        value={value}
        checked={isChecked}
        onChange={() => ctx.onValueChange?.(value)}
        className={cn(
          "h-4 w-4 rounded-full border border-white/30 bg-white/5 cursor-pointer",
          "accent-[hsl(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/40",
          className,
        )}
        {...props}
      />
    );
  },
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
