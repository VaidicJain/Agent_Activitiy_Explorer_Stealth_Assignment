"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/http";

const MAX_RETRIES = 2;

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // The API is slow and flaky: retry transient failures only, with a short capped backoff.
        retry: (failureCount, error) =>
          error instanceof ApiError && error.retryable && failureCount < MAX_RETRIES,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
        // Run the request even when the browser reports offline: otherwise TanStack Query pauses it
        // silently and the user sees skeleton rows forever instead of a clear error with Retry.
        networkMode: "always",
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
    },
  });
}

export function QueryProvider({ children }: { children: ReactNode }) {
  // useState keeps one client per browser session and a fresh one per server render (never shared).
  const [queryClient] = useState(createQueryClient);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
