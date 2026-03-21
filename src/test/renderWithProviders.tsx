import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';

/**
 * Creates a fresh QueryClient for tests.
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

interface WrapperOptions {
  queryClient?: QueryClient;
}

/**
 * Creates a wrapper component with providers for testing.
 */
export function createWrapper(options: WrapperOptions = {}) {
  const queryClient = options.queryClient ?? createTestQueryClient();

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

/**
 * Renders a component with all providers.
 */
export function renderWithProviders(
  ui: ReactNode,
  options: RenderOptions & WrapperOptions = {}
) {
  const { queryClient, ...renderOptions } = options;
  const wrapper = createWrapper({ queryClient });
  return render(ui, { wrapper, ...renderOptions });
}

/**
 * Renders routes in a MemoryRouter with QueryClient.
 */
export function renderWithRouter(
  routes: Parameters<typeof createMemoryRouter>[0],
  initialEntries: string[],
  options: WrapperOptions = {}
) {
  const queryClient = options.queryClient ?? createTestQueryClient();
  const router = createMemoryRouter(routes, { initialEntries });
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
