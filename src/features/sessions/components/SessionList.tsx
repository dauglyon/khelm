import { useNavigate } from 'react-router';
import { useSessions } from '../hooks/useSessions';
import { SessionCard } from './SessionCard';
import { Skeleton, Button } from '@/common/components';
import {
  listContainer,
  listHeader,
  listTitle,
  grid,
  emptyState,
  emptyTitle,
  skeletonGrid,
} from './SessionList.css';

export function SessionList() {
  const { sessions, isLoading, error } = useSessions();
  const navigate = useNavigate();

  // Sort sessions by updatedAt descending
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const handleCreateSession = () => {
    navigate('/session/new');
  };

  if (isLoading) {
    return (
      <div className={listContainer} data-testid="session-list-loading">
        <div className={listHeader}>
          <h1 className={listTitle}>Sessions</h1>
        </div>
        <div className={skeletonGrid}>
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} variant="rect" height={100} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={listContainer}>
        <div className={emptyState} role="alert">
          <p>Failed to load sessions. Please try again.</p>
        </div>
      </div>
    );
  }

  if (sortedSessions.length === 0) {
    return (
      <div className={listContainer} data-testid="session-list-empty">
        <div className={emptyState}>
          <div className={emptyTitle}>No sessions yet</div>
          <p>Create your first session to get started.</p>
          <div style={{ marginTop: '16px' }}>
            <Button onClick={handleCreateSession}>Create Session</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={listContainer} data-testid="session-list">
      <div className={listHeader}>
        <h1 className={listTitle}>Sessions</h1>
        <Button onClick={handleCreateSession}>Create Session</Button>
      </div>
      <div className={grid}>
        {sortedSessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
}
