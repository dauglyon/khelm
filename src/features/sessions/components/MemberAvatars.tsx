import { vars } from '@/theme';
import { avatarGroup, avatar, overflowBadge } from './MemberAvatars.css';

interface MemberAvatarsProps {
  memberIds: string[];
  maxDisplay?: number;
}

const INPUT_TYPE_KEYS = [
  'sql',
  'python',
  'literature',
  'chat',
  'note',
  'dataIngest',
  'task',
] as const;

/**
 * Derives a deterministic background color from a user ID using theme inputType tokens.
 */
function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const key = INPUT_TYPE_KEYS[Math.abs(hash) % INPUT_TYPE_KEYS.length];
  return vars.color.inputType[key].bg;
}

/**
 * Gets initials from a member ID (placeholder until we have displayName).
 */
function getInitials(id: string): string {
  return id.substring(0, 2).toUpperCase();
}

export function MemberAvatars({ memberIds, maxDisplay = 5 }: MemberAvatarsProps) {
  const visibleMembers = memberIds.slice(0, maxDisplay);
  const overflowCount = memberIds.length - maxDisplay;

  return (
    <div className={avatarGroup} data-testid="member-avatars">
      {visibleMembers.map((memberId) => (
        <div
          key={memberId}
          className={avatar}
          style={{ backgroundColor: getAvatarColor(memberId) }}
          title={memberId}
        >
          {getInitials(memberId)}
        </div>
      ))}
      {overflowCount > 0 && (
        <div className={overflowBadge} data-testid="member-overflow">
          +{overflowCount}
        </div>
      )}
    </div>
  );
}
