import { Outlet, useParams } from 'react-router';
import { useSession } from '@/features/sessions/hooks/useSession';
import { Spinner } from '@/common/components';

/**
 * Route guard: validates that the :id param refers to a valid session.
 * Uses the useSession hook for real validation via TanStack Query.
 */
export function RequireSession() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div role="alert" data-testid="session-error">
        <h2>Session not found</h2>
        <p>The session ID is missing or invalid.</p>
      </div>
    );
  }

  return <RequireSessionInner id={id} />;
}

function RequireSessionInner({ id }: { id: string }) {
  const { session, isLoading, error } = useSession(id);

  if (isLoading) {
    return (
      <div data-testid="session-loading" style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
        <Spinner size={24} />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div role="alert" data-testid="session-error">
        <h2>Session not found</h2>
        <p>The session could not be loaded. It may not exist or you may not have access.</p>
      </div>
    );
  }

  return <Outlet />;
}
