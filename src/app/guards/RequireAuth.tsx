import { Outlet, Navigate, useLocation } from 'react-router';
import { useIsAuthenticated } from '@/common/stores/authStore';

/**
 * Route guard: redirects unauthenticated users to /login.
 * Stores the intended destination in location state for post-login redirect.
 */
export function RequireAuth() {
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
