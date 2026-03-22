import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useCollaborationStore } from '../collaborationStore';
import { makeLockEntry, resetFixtureIds } from '../testing/fixtures';
import { LockBadge } from './LockBadge';

describe('LockBadge', () => {
  beforeEach(() => {
    resetFixtureIds();
    useCollaborationStore.getState().reset();
    useCollaborationStore.getState().setMyUserId('my-user');
  });

  it('renders nothing when card is not locked', () => {
    const { container } = render(<LockBadge cardId="c1" />);
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing when locked by current user', () => {
    const lock = makeLockEntry({
      cardId: 'c1',
      holderId: 'my-user',
      holderName: 'Me',
    });
    useCollaborationStore.getState().setLock('c1', lock);
    useCollaborationStore.getState().setMyLockedCardId('c1');

    const { container } = render(<LockBadge cardId="c1" />);
    expect(container.innerHTML).toBe('');
  });

  it('renders badge when locked by another human', () => {
    const lock = makeLockEntry({
      cardId: 'c1',
      holderId: 'other-user',
      holderName: 'Alice',
      holderRole: 'human',
    });
    useCollaborationStore.getState().setLock('c1', lock);

    render(<LockBadge cardId="c1" />);
    expect(screen.getByTestId('lock-badge-c1')).toBeDefined();
  });

  it('shows "Being edited by [Name]" tooltip for human lock', () => {
    const lock = makeLockEntry({
      cardId: 'c1',
      holderId: 'other-user',
      holderName: 'Alice',
      holderRole: 'human',
    });
    useCollaborationStore.getState().setLock('c1', lock);

    render(<LockBadge cardId="c1" />);

    const badge = screen.getByTestId('lock-badge-c1');
    fireEvent.mouseEnter(badge);

    expect(screen.getByRole('tooltip')).toBeDefined();
    expect(screen.getByText('Being edited by Alice')).toBeDefined();
  });

  it('shows AI icon and "AI is generating..." tooltip for AI lock', () => {
    const lock = makeLockEntry({
      cardId: 'c1',
      holderId: 'ai-user',
      holderName: 'AI Assistant',
      holderRole: 'ai',
    });
    useCollaborationStore.getState().setLock('c1', lock);

    render(<LockBadge cardId="c1" />);

    expect(screen.getByText('AI')).toBeDefined();

    const badge = screen.getByTestId('lock-badge-c1');
    fireEvent.mouseEnter(badge);

    expect(screen.getByText('AI is generating...')).toBeDefined();
  });
});
