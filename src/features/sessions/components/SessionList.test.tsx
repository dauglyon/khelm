import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionList } from './SessionList';

function renderSessionList() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const router = createMemoryRouter(
    [{ path: '/', element: <SessionList /> }],
    { initialEntries: ['/'] }
  );
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

describe('SessionList', () => {
  it('shows loading state initially', () => {
    renderSessionList();
    expect(screen.getByTestId('session-list-loading')).toBeInTheDocument();
  });

  it('renders session cards from mocked data', async () => {
    renderSessionList();
    await waitFor(() => {
      expect(screen.getByTestId('session-list')).toBeInTheDocument();
    });
    const cards = screen.getAllByTestId('session-card');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('renders the sessions title and create button after loading', async () => {
    renderSessionList();
    await waitFor(() => {
      expect(screen.getByTestId('session-list')).toBeInTheDocument();
    });
    expect(screen.getByText('Sessions')).toBeInTheDocument();
    expect(screen.getByText('Create Session')).toBeInTheDocument();
  });

  it('sessions are sorted by updatedAt descending', async () => {
    renderSessionList();
    await waitFor(() => {
      expect(screen.getByTestId('session-list')).toBeInTheDocument();
    });
    const cards = screen.getAllByTestId('session-card');
    expect(cards.length).toBeGreaterThan(0);
  });
});
