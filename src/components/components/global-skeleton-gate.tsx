/**
 * @module GlobalSkeletonGate
 *
 * App-level loading skeleton displayed during initial hydration.
 *
 * Problem this solves:
 *   On first load, before TanStack Query rehydrates and before the session
 *   is validated, the app may flash unauthenticated/empty states for ~200ms.
 *   This gate shows a full-screen skeleton shimmer during that window.
 *
 * Usage — place in the root layout:
 *   <GlobalSkeletonGate isReady={!!session && isHydrated}>
 *     <App />
 *   </GlobalSkeletonGate>
 *
 * Props:
 *   isReady      — When true, renders children. When false, renders skeleton.
 *   label        — Optional accessible loading label (for screen readers).
 *   skeleton     — Optional custom skeleton component. Defaults to the
 *                  built-in full-screen shimmer.
 *   minDurationMs — Minimum skeleton display time in ms to prevent flash.
 *                   Defaults to 0 (no minimum). Set to ~300 for smooth UX.
 */
"use client";

import { useEffect, useState, type ReactNode } from "react";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface GlobalSkeletonGateProps {
  isReady: boolean;
  children: ReactNode;
  label?: string;
  skeleton?: ReactNode;
  minDurationMs?: number;
}

// ─── Default skeleton ─────────────────────────────────────────────────────────

function DefaultFullPageSkeleton({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      aria-live="polite"
      className="flex min-h-screen w-full flex-col gap-6 bg-background p-6 md:p-10"
    >
      {/* Nav bar skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-muted" />
        <div className="flex gap-3">
          <div className="h-8 w-20 animate-pulse rounded-lg bg-muted" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
        </div>
      </div>

      {/* Hero skeleton */}
      <div className="h-48 w-full animate-pulse rounded-2xl bg-muted md:h-64" />

      {/* Card grid skeleton */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="aspect-square animate-pulse rounded-xl bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>

      <span className="sr-only">{label}</span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Renders a loading skeleton while `isReady` is false, then smoothly
 * transitions to `children` once the app is ready to render.
 *
 * Args:
 *   isReady: Whether the application state is ready to render.
 *   children: The actual application content to render when ready.
 *   label: ARIA label for the skeleton (default: "Loading Fashionistar…").
 *   skeleton: Custom skeleton component override.
 *   minDurationMs: Minimum duration to show skeleton (prevents flash).
 *
 * Returns:
 *   The skeleton while loading, or children when ready.
 */
export function GlobalSkeletonGate({
  isReady,
  children,
  label = "Loading Fashionistar…",
  skeleton,
  minDurationMs = 0,
}: GlobalSkeletonGateProps) {
  const [canShow, setCanShow] = useState(minDurationMs === 0);

  useEffect(() => {
    if (minDurationMs > 0) {
      const timer = setTimeout(() => setCanShow(true), minDurationMs);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [minDurationMs]);

  if (!isReady || !canShow) {
    return <>{skeleton ?? <DefaultFullPageSkeleton label={label} />}</>;
  }

  return <>{children}</>;
}
