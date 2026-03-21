import {
  useDeleteSession as useGeneratedDeleteSession,
  getListSessionsQueryKey,
} from '@/generated/api/sessions/sessions';
import { useQueryClient } from '@tanstack/react-query';
import { useSessionStore } from '../stores/sessionStore';

/**
 * Hook to delete a session.
 * On success, invalidates the session list and clears activeSessionId if needed.
 */
export function useDeleteSessionMutation() {
  const queryClient = useQueryClient();

  const mutation = useGeneratedDeleteSession({
    mutation: {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: getListSessionsQueryKey(),
        });
        // Clear active session if it was deleted
        const activeId = useSessionStore.getState().activeSessionId;
        if (activeId === variables.id) {
          useSessionStore.getState().setActiveSession(null);
        }
      },
    },
  });

  const deleteSession = (id: string) => {
    return mutation.mutateAsync({ id });
  };

  return {
    deleteSession,
    isDeleting: mutation.isPending,
  };
}
