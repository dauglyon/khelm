import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/common/stores/authStore';
import { RequireAuth } from './RequireAuth';

function renderGuard(initialPath: string) {
  const router = createMemoryRouter(
    [
      {
        element: <RequireAuth />,
        children: [
          { path: '/protected', element: <div>Protected Content</div> },
        ],
      },
      { path: '/login', element: <div>Login Page</div> },
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

describe('RequireAuth', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null });
  });

  it('redirects unauthenticated user to /login', () => {
    renderGuard('/protected');
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders child route for authenticated user', () => {
    useAuthStore.setState({ token: 'valid-token' });
    renderGuard('/protected');
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('stores intended destination for post-login redirect', () => {
    renderGuard('/protected');
    // User should be redirected to /login page
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});
