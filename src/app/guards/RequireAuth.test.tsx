import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/common/stores/authStore';
import { RequireAuth } from './RequireAuth';
import { createTestQueryClient } from '@/test';

function LoginPageWithState() {
  const location = useLocation();
  return (
    <div>
      <span>Login Page</span>
      {location.state?.from?.pathname && (
        <span data-testid="redirect-from">{location.state.from.pathname}</span>
      )}
    </div>
  );
}

function renderGuard(initialPath: string) {
  const router = createMemoryRouter(
    [
      {
        element: <RequireAuth />,
        children: [
          { path: '/protected', element: <div>Protected Content</div> },
        ],
      },
      { path: '/login', element: <LoginPageWithState /> },
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
    expect(screen.getByTestId('redirect-from')).toHaveTextContent('/protected');
  });
});
