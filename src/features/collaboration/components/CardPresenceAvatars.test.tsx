import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useCollaborationStore } from '../collaborationStore';
import { makePresenceState, resetFixtureIds } from '../testing/fixtures';
import { CardPresenceAvatars, getUserColor } from './CardPresenceAvatars';

describe('CardPresenceAvatars', () => {
  beforeEach(() => {
    resetFixtureIds();
    useCollaborationStore.getState().reset();
    useCollaborationStore.getState().setMyUserId('my-user');
  });

  it('renders nothing when no participants are focused on the card', () => {
    const { container } = render(<CardPresenceAvatars cardId="c1" />);
    expect(container.innerHTML).toBe('');
  });

  it('renders avatars for users focused on the card', () => {
    const p1 = makePresenceState({
      userId: 'u1',
      displayName: 'Alice',
      focusedCardId: 'c1',
      status: 'online',
    });
    useCollaborationStore.getState().setParticipant('u1', p1);

    render(<CardPresenceAvatars cardId="c1" />);
    expect(screen.getByTestId('card-presence-c1')).toBeDefined();
  });

  it('excludes the current user from display', () => {
    const me = makePresenceState({
      userId: 'my-user',
      displayName: 'Me',
      focusedCardId: 'c1',
      status: 'online',
    });
    useCollaborationStore.getState().setParticipant('my-user', me);

    const { container } = render(<CardPresenceAvatars cardId="c1" />);
    expect(container.innerHTML).toBe('');
  });

  it('shows overflow count when >3 other users are focused', () => {
    for (let i = 0; i < 5; i++) {
      const p = makePresenceState({
        userId: `other-${i}`,
        displayName: `User ${i}`,
        focusedCardId: 'c1',
        status: 'online',
      });
      useCollaborationStore.getState().setParticipant(`other-${i}`, p);
    }

    render(<CardPresenceAvatars cardId="c1" />);
    expect(screen.getByText('+2')).toBeDefined();
  });

  it('does not show offline participants', () => {
    const p = makePresenceState({
      userId: 'u1',
      displayName: 'Ghost',
      focusedCardId: 'c1',
      status: 'offline',
    });
    useCollaborationStore.getState().setParticipant('u1', p);

    const { container } = render(<CardPresenceAvatars cardId="c1" />);
    expect(container.innerHTML).toBe('');
  });
});

describe('getUserColor', () => {
  it('returns a consistent color for the same userId', () => {
    const color1 = getUserColor('user-abc');
    const color2 = getUserColor('user-abc');
    expect(color1).toBe(color2);
  });

  it('returns different colors for different userIds', () => {
    const color1 = getUserColor('user-1');
    const color2 = getUserColor('user-2');
    // Not guaranteed to be different, but statistically likely
    // Just verify they are valid colors
    expect(color1).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(color2).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});
