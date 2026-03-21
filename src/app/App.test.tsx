import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { routeConfig } from './routes';

describe('App', () => {
  it('renders the home page at root with session list', async () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ['/'],
    });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    );
    await waitFor(() => {
      expect(screen.getByText('Sessions')).toBeInTheDocument();
    });
  });
});
