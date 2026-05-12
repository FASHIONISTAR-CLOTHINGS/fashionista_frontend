    /**
 * @file select.tsx
 * @description Fashionistar Select primitive — Shadcn-compatible API.
 * A controlled native <select> wrapper with our glassmorphism design system.
 * For complex comboboxes, use a dedicated Combobox component.
 */
"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ── SelectTrigger ──────────────────────────────────────────────────────────────

export interface SelectTriggerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
}

export function SelectTrigger({ className, children, disabled, ...props }: SelectTriggerProps) {
  return (
    <div
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-xl border border-white/10 bg-white/5",
        "px-3 py-2 text-sm text-white cursor-pointer",
        "focus-within:border-[hsl(var(--accent))] focus-within:ring-1 focus-within:ring-[hsl(var(--accent))]/30",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 text-white/40 shrink-0" />
    </div>
  );
}

// ── SelectValue ────────────────────────────────────────────────────────────────

export interface SelectValueProps {
  placeholder?: string;
}

export function SelectValue({ placeholder }: SelectValueProps) {
  return <span className="text-white/30 text-sm">{placeholder}</span>;
}

// ── SelectContent ──────────────────────────────────────────────────────────────

export function SelectContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "absolute z-50 mt-1 w-full rounded-xl border border-white/10 bg-zinc-900 shadow-xl overflow-hidden",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ── SelectItem ─────────────────────────────────────────────────────────────────

export interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function SelectItem({ className, value: _value, children, ...props }: SelectItemProps) {
  return (
    <div
      className={cn(
        "px-3 py-2 text-sm text-white/80 cursor-pointer",
        "hover:bg-white/10 hover:text-white transition-colors",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ── Select (root controlled) ────────────────────────────────────────────────────
// A controlled <select> styled with the design system.

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

/**
 * Select — a native <select> wrapper with Shadcn-compatible `onValueChange` API.
 * Internally delegates to <select> for proper form semantics, keyboard nav,
 * and mobile OS pickers. Visual chrome uses our glassmorphism tokens.
 */
export function Select({ value, defaultValue, onValueChange, disabled, children }: SelectProps) {
  // Extract SelectItem values for native rendering
  // We render as native <select> to ensure accessibility and mobile support.
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onValueChange?.(e.target.value);
  };

  // We extract SelectItem children and render native <option> elements.
  const options = extractOptions(children);

  return (
    <div className="relative w-full">
      <select
        value={value ?? defaultValue ?? ""}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          "w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 pr-8",
          "text-sm text-white outline-none",
          "focus:border-[hsl(var(--accent))] focus:ring-1 focus:ring-[hsl(var(--accent))]/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-colors duration-150",
        )}
      >
        {options}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
    </div>
  );
}

/**
 * Recursively extract SelectItem children and render as native <option>.
 * Supports SelectContent and direct SelectItem children.
 */
function extractOptions(children: React.ReactNode): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return null;
    // If this is a SelectContent wrapper, recurse into its children
    if (
      child.type === SelectContent ||
      (typeof child.type === "function" &&
        (child.type as React.FC).displayName === "SelectContent")
    ) {
      return extractOptions((child.props as { children: React.ReactNode }).children);
    }
    // If this is a SelectItem, render as native <option>
    if (
      child.type === SelectItem ||
      (typeof child.type === "function" &&
        (child.type as React.FC).displayName === "SelectItem")
    ) {
      const { value, children: label } = child.props as SelectItemProps;
      return <option key={value} value={value}>{label}</option>;
    }
    // Passthrough FormControl wrappers (which just render children)
    if ((child.props as { children?: React.ReactNode }).children) {
      return extractOptions((child.props as { children: React.ReactNode }).children);
    }
    return null;
  });
}
