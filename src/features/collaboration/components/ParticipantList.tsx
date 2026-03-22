/**
 * Session header participant list showing avatars with online/idle/offline status.
 */

import { useState } from 'react';
import { useParticipants } from '../collaborationStore';
import type { PresenceState } from '../types';
import {
  container,
  avatarWrapper,
  avatar,
  avatarFallback,
  statusDot,
  overflow,
  tooltip,
} from './ParticipantList.css';

const MAX_VISIBLE = 5;

const STATUS_COLORS: Record<PresenceState['status'], string> = {
  online: '#1A7F5A',
  idle: '#B8660D',
  offline: '#9E9E9E',
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

interface AvatarItemProps {
  participant: PresenceState;
}

function AvatarItem({ participant }: AvatarItemProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [imgError, setImgError] = useState(false);

  const focusLabel = participant.focusedCardId
    ? `Focused on card`
    : 'No card';

  return (
    <div
      className={avatarWrapper}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      data-testid={`participant-${participant.userId}`}
    >
      {participant.avatarUrl && !imgError ? (
        <img
          className={avatar}
          src={participant.avatarUrl}
          alt={participant.displayName}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className={avatarFallback} aria-label={participant.displayName}>
          {getInitials(participant.displayName)}
        </div>
      )}
      <span
        className={statusDot}
        style={{ backgroundColor: STATUS_COLORS[participant.status] }}
        aria-label={`Status: ${participant.status}`}
      />
      {showTooltip && (
        <span className={tooltip} role="tooltip">
          {participant.displayName} - {focusLabel}
        </span>
      )}
    </div>
  );
}

export function ParticipantList() {
  const participants = useParticipants();

  const visible = participants.slice(0, MAX_VISIBLE);
  const overflowCount = participants.length - MAX_VISIBLE;

  return (
    <div className={container} role="list" aria-label="Session participants">
      {visible.map((p) => (
        <AvatarItem key={p.userId} participant={p} />
      ))}
      {overflowCount > 0 && (
        <div className={overflow} aria-label={`${overflowCount} more participants`}>
          +{overflowCount}
        </div>
      )}
    </div>
  );
}
