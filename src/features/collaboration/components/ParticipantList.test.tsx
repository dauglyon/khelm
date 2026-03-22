import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useCollaborationStore } from '../collaborationStore';
import { makePresenceState, resetFixtureIds } from '../testing/fixtures';
import { ParticipantList } from './ParticipantList';

describe('ParticipantList', () => {
  beforeEach(() => {
    resetFixtureIds();
    useCollaborationStore.getState().reset();
  });

  it('renders no avatars when no participants', () => {
    render(<ParticipantList />);
    const list = screen.getByRole('list');
    expect(list.children).toHaveLength(0);
  });

  it('renders avatars for participants', () => {
    const p1 = makePresenceState({ userId: 'u1', displayName: 'Alice' });
    const p2 = makePresenceState({ userId: 'u2', displayName: 'Bob' });
    useCollaborationStore.getState().setParticipant('u1', p1);
    useCollaborationStore.getState().setParticipant('u2', p2);

    render(<ParticipantList />);
    expect(screen.getByTestId('participant-u1')).toBeDefined();
    expect(screen.getByTestId('participant-u2')).toBeDefined();
  });

  it('shows overflow indicator when >5 participants', () => {
    for (let i = 0; i < 7; i++) {
      const p = makePresenceState({
        userId: `user-${i}`,
        displayName: `User ${i}`,
      });
      useCollaborationStore.getState().setParticipant(`user-${i}`, p);
    }

    render(<ParticipantList />);
    expect(screen.getByText('+2')).toBeDefined();
  });

  it('shows status dots with correct colors', () => {
    const online = makePresenceState({
      userId: 'u1',
      displayName: 'Online User',
      status: 'online',
    });
    useCollaborationStore.getState().setParticipant('u1', online);

    render(<ParticipantList />);
    const dot = screen.getByLabelText('Status: online');
    expect(dot).toBeDefined();
  });

  it('shows initials fallback when avatar fails to load', () => {
    const p = makePresenceState({
      userId: 'u1',
      displayName: 'Alice Bob',
      avatarUrl: '',
    });
    useCollaborationStore.getState().setParticipant('u1', p);

    render(<ParticipantList />);
    expect(screen.getByText('AB')).toBeDefined();
  });
});
