/**
 * Lock holder avatar badge for card headers.
 * Shows the lock holder's avatar when a card is locked by another user.
 * Hidden when the current user holds the lock.
 */

import { useState } from 'react';
import {
  useLockHolder,
  useIsCardLockedByMe,
  useLock,
} from '../collaborationStore';
import { getUserColor } from './CardPresenceAvatars';
import {
  badgeContainer,
  badgeAvatar,
  badgeFallback,
  aiIcon,
  badgeTooltip,
} from './LockBadge.css';

export interface LockBadgeProps {
  cardId: string;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function LockBadge({ cardId }: LockBadgeProps) {
  const lockHolder = useLockHolder(cardId);
  const isLockedByMe = useIsCardLockedByMe(cardId);
  const lock = useLock(cardId);
  const [showTooltip, setShowTooltip] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Don't show badge for own lock or when no lock exists
  if (!lockHolder || isLockedByMe || !lock) {
    return null;
  }

  const color = getUserColor(lock.holderId);
  const tooltipText =
    lockHolder.role === 'ai'
      ? 'AI is generating...'
      : `Being edited by ${lockHolder.name}`;

  return (
    <div
      className={badgeContainer}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      data-testid={`lock-badge-${cardId}`}
    >
      {lockHolder.role === 'ai' ? (
        <span
          className={aiIcon}
          style={{ boxShadow: `0 0 0 2px ${color}` }}
          aria-label="AI is generating"
        >
          AI
        </span>
      ) : !imgError ? (
        <img
          className={badgeAvatar}
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(lockHolder.name)}&size=24`}
          alt={lockHolder.name}
          style={{ boxShadow: `0 0 0 2px ${color}` }}
          onError={() => setImgError(true)}
        />
      ) : (
        <span
          className={badgeFallback}
          style={{ boxShadow: `0 0 0 2px ${color}` }}
          aria-label={lockHolder.name}
        >
          {getInitials(lockHolder.name)}
        </span>
      )}
      {showTooltip && (
        <span className={badgeTooltip} role="tooltip">
          {tooltipText}
        </span>
      )}
    </div>
  );
}
