import { useNavigate } from 'react-router';
import type { Session } from '@/generated/api/sessions.schemas';
import { formatRelativeTime } from '@/common/utils/formatDate';
import { card, cardTitle, cardMeta, memberCount } from './SessionCard.css';

interface SessionCardProps {
  session: Session;
}

export function SessionCard({ session }: SessionCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/session/${session.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(`/session/${session.id}`);
    }
  };

  return (
    <div
      className={card}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="link"
      tabIndex={0}
      data-testid="session-card"
      aria-label={`Open session: ${session.title}`}
    >
      <div className={cardTitle}>{session.title}</div>
      <div className={cardMeta}>
        <span>{formatRelativeTime(session.updatedAt)}</span>
        <span className={memberCount}>
          {session.memberIds.length} {session.memberIds.length === 1 ? 'member' : 'members'}
        </span>
      </div>
    </div>
  );
}
