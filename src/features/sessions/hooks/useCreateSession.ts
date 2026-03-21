import {
  useCreateSession as useGeneratedCreateSession,
  getListSessionsQueryKey,
} from '@/generated/api/sessions/sessions';
import { useQueryClient } from '@tanstack/react-query';
import type { Session } from '@/generated/api/sessions.schemas';

/**
 * Hook to create a new session.
 * On success, invalidates the session list cache.
 */
export function useCreateSessionMutation() {
  const queryClient = useQueryClient();

  const mutation = useGeneratedCreateSession({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getListSessionsQueryKey(),
        });
      },
    },
  });

  const createSession = (title: string) => {
    return mutation.mutateAsync({ data: { title } });
  };

  const createdSession: Session | undefined =
    mutation.data?.status === 201 ? mutation.data.data : undefined;

  return {
    createSession,
    createdSession,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
}
