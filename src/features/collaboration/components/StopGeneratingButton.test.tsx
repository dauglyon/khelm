import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createMockSocket } from '../testing/mockSocket';
import { useCollaborationStore } from '../collaborationStore';
import { makeLockEntry, resetFixtureIds } from '../testing/fixtures';
import type { MockSocket } from '../testing/mockSocket';

let mockSocket: MockSocket;

vi.mock('../socketClient', () => ({
  getSocket: () => mockSocket,
}));

// Import after mocking
const { StopGeneratingButton } = await import('./StopGeneratingButton');

describe('StopGeneratingButton', () => {
  beforeEach(() => {
    resetFixtureIds();
    mockSocket = createMockSocket();
    useCollaborationStore.getState().reset();
    useCollaborationStore.getState().setMyUserId('my-user');
  });

  it('renders nothing when card is not locked', () => {
    const { container } = render(
      <StopGeneratingButton cardId="c1" />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing when locked by human', () => {
    const lock = makeLockEntry({
      cardId: 'c1',
      holderId: 'other-user',
      holderRole: 'human',
    });
    useCollaborationStore.getState().setLock('c1', lock);

    const { container } = render(
      <StopGeneratingButton cardId="c1" />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders button when locked by AI', () => {
    const lock = makeLockEntry({
      cardId: 'c1',
      holderId: 'ai-user',
      holderRole: 'ai',
    });
    useCollaborationStore.getState().setLock('c1', lock);

    render(<StopGeneratingButton cardId="c1" />);
    expect(screen.getByText('Stop generating')).toBeDefined();
  });

  it('emits preempt event on click', () => {
    const lock = makeLockEntry({
      cardId: 'c1',
      holderId: 'ai-user',
      holderRole: 'ai',
    });
    useCollaborationStore.getState().setLock('c1', lock);

    render(<StopGeneratingButton cardId="c1" />);

    fireEvent.click(screen.getByText('Stop generating'));

    const lastEmit = mockSocket.getLastEmit('card:lock:preempt');
    expect(lastEmit).toEqual([{ cardId: 'c1' }]);
  });

  it('shows "Stopping..." after click', () => {
    const lock = makeLockEntry({
      cardId: 'c1',
      holderId: 'ai-user',
      holderRole: 'ai',
    });
    useCollaborationStore.getState().setLock('c1', lock);

    render(<StopGeneratingButton cardId="c1" />);

    fireEvent.click(screen.getByText('Stop generating'));

    expect(screen.getByText('Stopping...')).toBeDefined();
  });

  it('has aria-label for accessibility', () => {
    const lock = makeLockEntry({
      cardId: 'c1',
      holderId: 'ai-user',
      holderRole: 'ai',
    });
    useCollaborationStore.getState().setLock('c1', lock);

    render(<StopGeneratingButton cardId="c1" />);
    expect(
      screen.getByLabelText('Stop generating')
    ).toBeDefined();
  });
});
