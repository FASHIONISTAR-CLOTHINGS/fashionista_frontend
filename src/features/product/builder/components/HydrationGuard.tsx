// fashionista_frontend/src/features/product/builder/components/HydrationGuard.tsx
"use client";

import { useState, useEffect, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface HydrationGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function HydrationGuard({ children, fallback }: HydrationGuardProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      fallback || (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 text-[#01454A] animate-spin" />
          <p className="text-sm text-[#5A6465] animate-pulse">Initializing garment builder state...</p>
        </div>
      )
    );
  }

  return <>{children}</>;
}
