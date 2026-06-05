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
          "flex min-h-[80px] w-full rounded-xl border border-[#D9D9D9] bg-white px-3 py-2 text-sm text-[#1A1208]",
          "placeholder:text-zinc-400 outline-none",
          "focus:border-[#01454A] focus:ring-2 focus:ring-[#01454A]/15",
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
