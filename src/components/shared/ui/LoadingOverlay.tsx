"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
  visible: boolean;
  label?: string;
  className?: string;
  children?: ReactNode;
}

export function LoadingOverlay({ visible, label = "Loading...", className, children }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm", className)}>
      <div className="flex flex-col items-center gap-4">
        {children || (
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        )}
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
