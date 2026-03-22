import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { RequireSession } from './RequireSession';
import { createTestQueryClient } from '@/test';

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
  const queryClient = createTestQueryClient();
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

  it('shows error state when session returns 404', async () => {
    server.use(
      http.get('*/sessions/:id', () => {
        return HttpResponse.json({ message: 'Not found' }, { status: 404 });
      })
    );
    renderGuard('/session/test-id');
    await waitFor(() => {
      expect(screen.getByTestId('session-error')).toBeInTheDocument();
    });
  });
});
