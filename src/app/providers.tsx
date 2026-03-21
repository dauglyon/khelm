import { type ReactNode, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { themeClass } from '@/theme';

/**
 * Shared QueryClient instance.
 * Exported for test use.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
});

/**
 * Applies the vanilla-extract theme class to document.body.
 */
function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.body.classList.add(themeClass);
    return () => {
      document.body.classList.remove(themeClass);
    };
  }, []);

  return <>{children}</>;
}

/**
 * Composes app-level providers in the correct order (outermost first):
 * 1. ThemeProvider
 * 2. QueryClientProvider
 *
 * RouterProvider is rendered separately since it manages its own tree.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
