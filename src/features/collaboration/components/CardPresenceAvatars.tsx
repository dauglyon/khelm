/**
 * Avatar stack shown in card headers for users focused on that card.
 * Excludes the current user from the display.
 */

import { useState } from 'react';
import {
  useParticipantsOnCard,
  useCollaborationStore,
} from '../collaborationStore';
import {
  container,
  avatarItem,
  avatarFallback,
  overflowCount,
} from './CardPresenceAvatars.css';

const MAX_VISIBLE = 3;

// 8-color palette for user-assigned colors
const PALETTE = [
  '#2B6CB0',
  '#7B4EA3',
  '#1A7F5A',
  '#B8660D',
  '#C53030',
  '#2D8E8E',
  '#7A6340',
  '#6B46C1',
];

/**
 * Derive a stable color from a userId using a simple hash.
 */
export function getUserColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) | 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export interface CardPresenceAvatarsProps {
  cardId: string;
}

export function CardPresenceAvatars({ cardId }: CardPresenceAvatarsProps) {
  const participants = useParticipantsOnCard(cardId);
  const myUserId = useCollaborationStore((state) => state.myUserId);

  // Exclude self
  const others = participants.filter((p) => p.userId !== myUserId);

  if (others.length === 0) return null;

  const visible = others.slice(0, MAX_VISIBLE);
  const extra = others.length - MAX_VISIBLE;

  return (
    <div className={container} data-testid={`card-presence-${cardId}`}>
      {visible.map((p) => (
        <AvatarSmall
          key={p.userId}
          avatarUrl={p.avatarUrl}
          displayName={p.displayName}
          userId={p.userId}
        />
      ))}
      {extra > 0 && (
        <span className={overflowCount}>+{extra}</span>
      )}
    </div>
  );
}

interface AvatarSmallProps {
  avatarUrl: string;
  displayName: string;
  userId: string;
}

function AvatarSmall({ avatarUrl, displayName, userId }: AvatarSmallProps) {
  const [imgError, setImgError] = useState(false);
  const color = getUserColor(userId);

  if (avatarUrl && !imgError) {
    return (
      <img
        className={avatarItem}
        src={avatarUrl}
        alt={displayName}
        style={{ boxShadow: `0 0 0 2px ${color}` }}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <span
      className={avatarFallback}
      aria-label={displayName}
      style={{ boxShadow: `0 0 0 2px ${color}` }}
    >
      {getInitials(displayName)}
    </span>
  );
}
