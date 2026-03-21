import { useEffect } from 'react';
import { useGetSession } from '@/generated/api/sessions/sessions';
import { useSessionStore } from '../stores/sessionStore';
import type { Session } from '@/generated/api/sessions.schemas';

/**
 * Hook to fetch a single session by ID.
 * Wraps the generated useGetSession hook and sets activeSessionId.
 */
export function useSession(sessionId: string) {
  const query = useGetSession(sessionId);
  const setActiveSession = useSessionStore((s) => s.setActiveSession);

  const session: Session | undefined =
    query.data?.status === 200 ? query.data.data : undefined;

  useEffect(() => {
    if (session) {
      setActiveSession(session.id);
    }
    return () => {
      setActiveSession(null);
    };
  }, [session, setActiveSession]);

  return {
    session,
    isLoading: query.isLoading,
    error: query.error,
  };
}
