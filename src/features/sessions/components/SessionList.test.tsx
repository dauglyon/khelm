import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { LazyMotionProvider } from '@/common/animations';
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
    <LazyMotionProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </LazyMotionProvider>
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
    const sessions = [
      {
        id: 'aaa',
        title: 'Oldest Session',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        ownerId: 'user1',
        memberIds: ['user1'],
        status: 'active' as const,
      },
      {
        id: 'bbb',
        title: 'Newest Session',
        createdAt: '2024-03-01T00:00:00Z',
        updatedAt: '2024-03-01T00:00:00Z',
        ownerId: 'user1',
        memberIds: ['user1'],
        status: 'active' as const,
      },
      {
        id: 'ccc',
        title: 'Middle Session',
        createdAt: '2024-02-01T00:00:00Z',
        updatedAt: '2024-02-01T00:00:00Z',
        ownerId: 'user1',
        memberIds: ['user1'],
        status: 'active' as const,
      },
    ];

    server.use(
      http.get('*/sessions', () => HttpResponse.json(sessions, { status: 200 }))
    );

    renderSessionList();
    await waitFor(() => {
      expect(screen.getByTestId('session-list')).toBeInTheDocument();
    });

    const cards = screen.getAllByTestId('session-card');
    expect(cards[0]).toHaveAttribute('aria-label', 'Open session: Newest Session');
    expect(cards[1]).toHaveAttribute('aria-label', 'Open session: Middle Session');
    expect(cards[2]).toHaveAttribute('aria-label', 'Open session: Oldest Session');
  });

  it('shows empty state with create button when no sessions exist', async () => {
    server.use(
      http.get('*/sessions', () => HttpResponse.json([], { status: 200 }))
    );

    renderSessionList();
    await waitFor(() => {
      expect(screen.getByTestId('session-list-empty')).toBeInTheDocument();
    });
    expect(screen.getByText('Create Session')).toBeInTheDocument();
  });

  it('navigates to session detail page when a session card is clicked', async () => {
    const sessions = [
      {
        id: 'nav-test-id',
        title: 'Nav Test Session',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        ownerId: 'user1',
        memberIds: ['user1'],
        status: 'active' as const,
      },
    ];

    server.use(
      http.get('*/sessions', () => HttpResponse.json(sessions, { status: 200 }))
    );

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const router = createMemoryRouter(
      [
        { path: '/', element: <SessionList /> },
        { path: '/session/:id', element: <div data-testid="session-detail" /> },
      ],
      { initialEntries: ['/'] }
    );
    render(
      <LazyMotionProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </LazyMotionProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('session-list')).toBeInTheDocument();
    });

    const card = screen.getByTestId('session-card');
    await userEvent.click(card);

    await waitFor(() => {
      expect(screen.getByTestId('session-detail')).toBeInTheDocument();
    });
  });
});
