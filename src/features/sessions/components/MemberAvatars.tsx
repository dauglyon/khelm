import { avatarGroup, avatar, overflowBadge } from './MemberAvatars.css';

interface MemberAvatarsProps {
  memberIds: string[];
  maxDisplay?: number;
}

/**
 * Derives a deterministic background color from a user ID.
 */
function getAvatarColor(id: string): string {
  const colors = [
    '#2B6CB0', '#7B4EA3', '#1A7F5A', '#B8660D',
    '#7A6340', '#2D8E8E', '#C53030', '#6B7268',
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
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
