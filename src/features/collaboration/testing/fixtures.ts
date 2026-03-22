/**
 * Factory functions for collaboration test data.
 * Each factory provides sensible defaults that can be overridden.
 */

import type { LockEntry, PresenceState, SessionSnapshot } from '../types';
import type { CardState } from '@/features/workspace/store/types';

let counter = 0;
function nextId(): string {
  counter += 1;
  return `test-id-${counter}`;
}

/** Reset the ID counter between tests */
export function resetFixtureIds(): void {
  counter = 0;
}

export function makeLockEntry(
  overrides: Partial<LockEntry> = {}
): LockEntry {
  const cardId = overrides.cardId ?? nextId();
  return {
    cardId,
    holderId: nextId(),
    holderName: 'Test User',
    holderRole: 'human',
    acquiredAt: Date.now(),
    expiresAt: Date.now() + 30_000,
    ...overrides,
  };
}

export function makePresenceState(
  overrides: Partial<PresenceState> = {}
): PresenceState {
  return {
    userId: nextId(),
    displayName: 'Test User',
    avatarUrl: 'https://example.com/avatar.png',
    status: 'online',
    focusedCardId: null,
    role: 'human',
    ...overrides,
  };
}

export function makeCardState(
  overrides: Partial<CardState> = {}
): CardState {
  const id = overrides.id ?? nextId();
  return {
    id,
    shortname: 'Test Card',
    type: 'note',
    status: 'complete',
    content: '',
    input: '',
    references: [],
    referencedBy: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

export function makeSessionSnapshot(
  overrides: Partial<SessionSnapshot> = {}
): SessionSnapshot {
  return {
    cards: [],
    locks: [],
    participants: [],
    ...overrides,
  };
}
