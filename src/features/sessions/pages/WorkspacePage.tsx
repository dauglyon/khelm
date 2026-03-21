import { useParams } from 'react-router';
import { WorkspaceLayout } from '../components/WorkspaceLayout';
import { SessionHeader } from '../components/SessionHeader';
import { useSession } from '../hooks/useSession';

export function WorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const { session } = useSession(id!);

  return (
    <WorkspaceLayout
      sessionHeader={session ? <SessionHeader session={session} /> : undefined}
    >
      <h1>Workspace: {id}</h1>
    </WorkspaceLayout>
  );
}
