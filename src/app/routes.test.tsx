import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/common/stores/authStore';
import { routeConfig } from './routes';

function renderWithRouter(initialEntries: string[]) {
  const router = createMemoryRouter(routeConfig, { initialEntries });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

describe('routes', () => {
  beforeEach(() => {
    // Ensure authenticated for protected routes
    useAuthStore.setState({ token: 'test-token' });
  });

  it('renders HomePage at / with session list', async () => {
    renderWithRouter(['/']);
    // The home page now renders SessionList which shows loading, then sessions
    await waitFor(() => {
      expect(screen.getByText('Sessions')).toBeInTheDocument();
    });
  });

  it('renders WorkspacePage at /session/:id with the id param', async () => {
    renderWithRouter(['/session/abc']);
    await waitFor(() => {
      expect(screen.getByText('Workspace: abc')).toBeInTheDocument();
    });
  });

  it('renders LoginPage at /login', () => {
    renderWithRouter(['/login']);
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('renders NotFoundPage for unknown paths', () => {
    renderWithRouter(['/nonexistent']);
    expect(screen.getByText('404 -- Page Not Found')).toBeInTheDocument();
  });

  it('renders NewSessionPage at /session/new', () => {
    renderWithRouter(['/session/new']);
    expect(screen.getByText('New Session')).toBeInTheDocument();
  });

  it('renders JoinSessionPage at /session/:id/join', () => {
    renderWithRouter(['/session/xyz/join']);
    expect(screen.getByText('Join Session: xyz')).toBeInTheDocument();
  });

  it('renders AuthCallbackPage at /callback', () => {
    renderWithRouter(['/callback']);
    expect(screen.getByText('Processing authentication...')).toBeInTheDocument();
  });
});
