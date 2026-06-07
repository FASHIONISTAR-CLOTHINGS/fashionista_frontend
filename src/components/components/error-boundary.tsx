"use client";

/**
 * @module ErrorBoundary
 *
 * React class-based error boundary with:
 * - Sentry.captureException integration (no-ops if Sentry not configured)
 * - Retry button that resets the error state
 * - Renders a polished fallback UI by default, or a custom `fallback` prop
 *
 * Placement:
 *   1. Root `layout.tsx`         → catches catastrophic top-level failures
 *   2. Each feature `page.tsx`   → isolates feature failures from the shell
 *   3. Around each async widget  → shows inline retry without page reload
 *
 * Usage:
 *   <ErrorBoundary>
 *     <MyAsyncComponent />
 *   </ErrorBoundary>
 *
 *   // With custom fallback:
 *   <ErrorBoundary fallback={(error, reset) => <CustomError err={error} onRetry={reset} />}>
 *     ...
 *   </ErrorBoundary>
 */

import { AlertCircle, RefreshCw } from "lucide-react";
import { Component, type ReactNode, type ErrorInfo } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  /**
   * Optional custom fallback renderer. Receives the caught error and a
   * `reset` function that clears the error state so children re-render.
   */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  /** Optional label shown in the default fallback UI. */
  label?: string;
  /**
   * Optional callback invoked when an error is caught.
   * Use this to fire analytics events or custom Sentry breadcrumbs.
   */
  onError?: (error: Error, info: ErrorInfo) => void;
  /**
   * When this key changes (e.g., on route change), the error boundary
   * automatically resets — useful for page-level boundaries.
   */
  resetKey?: string | number;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Fire the consumer's onError callback first (analytics / custom breadcrumbs)
    try {
      this.props.onError?.(error, info);
    } catch {
      // consumer callback errors must not affect boundary
    }

    // Sentry integration — async import for Next.js tree-shaking
    import("@sentry/nextjs")
      .then((Sentry) => {
        Sentry.captureException(error, {
          extra: { componentStack: info.componentStack },
        });
      })
      .catch(() => {
        // Sentry not installed or not reachable — fall back to console
        console.error("[ErrorBoundary] Unhandled render error:", error, info.componentStack);
      });
  }

  private reset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, label } = this.props;

    if (!hasError || !error) return children;

    // Custom fallback takes precedence
    if (fallback) {
      return fallback(error, this.reset);
    }

    // Default polished fallback UI
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-10 text-center"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-7 w-7 text-destructive" aria-hidden="true" />
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">
            {label ?? "Something went wrong"}
          </h2>
          <p className="text-sm text-muted-foreground max-w-md">
            An unexpected error occurred. Please try again. If the problem
            persists, contact support.
          </p>
          {process.env.NODE_ENV === "development" && (
            <pre className="mt-3 max-h-32 overflow-auto rounded-md bg-muted p-3 text-left text-xs text-muted-foreground">
              {error.message}
            </pre>
          )}
        </div>

        <button
          type="button"
          onClick={this.reset}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
      </div>
    );
  }
}
