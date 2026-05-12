/**
 * @file textarea.tsx
 * @description Fashionistar Textarea primitive — Shadcn-compatible API.
 */
import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white",
          "placeholder:text-white/30 outline-none",
          "focus:border-[hsl(var(--accent))] focus:ring-1 focus:ring-[hsl(var(--accent))]/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-colors duration-150 resize-y",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
