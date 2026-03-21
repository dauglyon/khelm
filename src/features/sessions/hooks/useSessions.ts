import { useListSessions } from '@/generated/api/sessions/sessions';
import type { Session } from '@/generated/api/sessions.schemas';

/**
 * Hook to fetch all sessions for the current user.
 * Wraps the generated useListSessions hook.
 */
export function useSessions() {
  const query = useListSessions();

  // Extract session data from the response wrapper
  const sessions: Session[] =
    query.data?.status === 200 ? query.data.data : [];

  return {
    sessions,
    isLoading: query.isLoading,
    error: query.error,
  };
}
