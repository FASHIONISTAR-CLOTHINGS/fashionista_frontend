"use client";
/**
 * TanStack Query Provider — Server State Management
 *
 * Wraps the app with QueryClientProvider.
 * Includes DevTools in development only.
 * QueryClient configured with enterprise defaults.
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is fresh for 1 minute — don't refetch if we just fetched
            staleTime: 60 * 1000,
            // Retry once on failure, except for auth errors
            retry: (failureCount, error: unknown) => {
              const status = (error as { response?: { status?: number } })
                ?.response?.status;
              if (status === 401 || status === 403 || status === 404)
                return false;
              return failureCount < 1;
            },
            // Refetch when window regains focus (keeps data fresh)
            refetchOnWindowFocus: false,
          },
          mutations: {
            // Don't retry mutations by default (idempotency concern)
            retry: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Devtools are intentionally disabled here because Turbopack was
          chunk-failing on the async devtools bundle during auth testing. */}
    </QueryClientProvider>
  );
}
