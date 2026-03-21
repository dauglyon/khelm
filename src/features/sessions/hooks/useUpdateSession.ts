import {
  useUpdateSession as useGeneratedUpdateSession,
  getListSessionsQueryKey,
  getGetSessionQueryKey,
} from '@/generated/api/sessions/sessions';
import { useQueryClient } from '@tanstack/react-query';
import type { UpdateSessionRequest } from '@/generated/api/sessions.schemas';

/**
 * Hook to update a session's title or status.
 * On success, invalidates both the session detail and list caches.
 */
export function useUpdateSessionMutation() {
  const queryClient = useQueryClient();

  const mutation = useGeneratedUpdateSession({
    mutation: {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: getListSessionsQueryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: getGetSessionQueryKey(variables.id),
        });
      },
    },
  });

  const updateSession = (id: string, data: UpdateSessionRequest) => {
    return mutation.mutateAsync({ id, data });
  };

  return {
    updateSession,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
}
