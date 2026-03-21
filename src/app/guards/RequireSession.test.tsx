import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RequireSession } from './RequireSession';

function renderGuard(initialPath: string) {
  const router = createMemoryRouter(
    [
      {
        element: <RequireSession />,
        children: [
          {
            path: '/session/:id',
            element: <div>Session Content</div>,
          },
        ],
      },
    ],
    { initialEntries: [initialPath] }
  );
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

describe('RequireSession', () => {
  it('renders child route after session loads', async () => {
    renderGuard('/session/test-id');
    // Wait for session data to load via MSW
    await waitFor(() => {
      expect(screen.getByText('Session Content')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    renderGuard('/session/test-id');
    expect(screen.getByTestId('session-loading')).toBeInTheDocument();
  });
});
