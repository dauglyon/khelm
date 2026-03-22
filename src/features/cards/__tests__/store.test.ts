import { describe, it, expect, beforeEach } from 'vitest';
import { useCardStore } from '../store';
import type { Card } from '../types';

function createTestCard(overrides: Partial<Card> = {}): Card {
  return {
    id: overrides.id ?? 'card-1',
    shortname: 'Test Card',
    type: 'sql',
    status: 'thinking',
    content: { query: 'SELECT 1', dataSource: 'test' },
    result: null,
    error: null,
    references: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'user-1',
    lockedBy: null,
    sessionId: 'session-1',
    ...overrides,
  };
}

describe('Card Store', () => {
  beforeEach(() => {
    useCardStore.setState({
      cards: new Map(),
      streamingContent: new Map(),
      chatStates: new Map(),
    });
  });

  describe('Card CRUD', () => {
    it('setCard adds a card', () => {
      const card = createTestCard();
      useCardStore.getState().setCard(card);
      expect(useCardStore.getState().cards.get('card-1')).toEqual(card);
    });

    it('updateCard updates card fields', () => {
      const card = createTestCard();
      useCardStore.getState().setCard(card);
      useCardStore.getState().updateCard('card-1', { shortname: 'Updated' });
      const updated = useCardStore.getState().cards.get('card-1');
      expect(updated?.shortname).toBe('Updated');
    });

    it('removeCard removes card and related state', () => {
      const card = createTestCard();
      useCardStore.getState().setCard(card);
      useCardStore.getState().initChat('card-1');
      useCardStore.getState().appendStreamContent('card-1', 'data');

      useCardStore.getState().removeCard('card-1');
      expect(useCardStore.getState().cards.has('card-1')).toBe(false);
      expect(useCardStore.getState().streamingContent.has('card-1')).toBe(false);
      expect(useCardStore.getState().chatStates.has('card-1')).toBe(false);
    });

    it('setCardStatus updates status', () => {
      useCardStore.getState().setCard(createTestCard());
      useCardStore.getState().setCardStatus('card-1', 'running');
      expect(useCardStore.getState().cards.get('card-1')?.status).toBe('running');
    });

    it('setCardResult updates result', () => {
      useCardStore.getState().setCard(createTestCard());
      const result = { columns: [], rows: [], rowCount: 0, truncated: false };
      useCardStore.getState().setCardResult('card-1', result);
      expect(useCardStore.getState().cards.get('card-1')?.result).toEqual(result);
    });

    it('setCardError sets status to error and populates error field', () => {
      useCardStore.getState().setCard(createTestCard());
      useCardStore.getState().setCardError('card-1', { code: 'ERR', message: 'fail' });
      const card = useCardStore.getState().cards.get('card-1');
      expect(card?.status).toBe('error');
      expect(card?.error).toEqual({ code: 'ERR', message: 'fail' });
    });
  });

  describe('Streaming', () => {
    it('appendStreamContent concatenates chunks', () => {
      useCardStore.getState().appendStreamContent('card-1', 'hello ');
      useCardStore.getState().appendStreamContent('card-1', 'world');
      expect(useCardStore.getState().streamingContent.get('card-1')).toBe('hello world');
    });

    it('finalizeStream clears streaming content', () => {
      useCardStore.getState().appendStreamContent('card-1', 'data');
      useCardStore.getState().finalizeStream('card-1');
      expect(useCardStore.getState().streamingContent.has('card-1')).toBe(false);
    });

    it('clearStreamContent removes streaming entry', () => {
      useCardStore.getState().appendStreamContent('card-1', 'data');
      useCardStore.getState().clearStreamContent('card-1');
      expect(useCardStore.getState().streamingContent.has('card-1')).toBe(false);
    });
  });

  describe('Chat', () => {
    it('initChat creates initial chat state', () => {
      useCardStore.getState().initChat('card-1');
      const chat = useCardStore.getState().chatStates.get('card-1');
      expect(chat).toEqual({
        messages: [],
        streamingContent: '',
        isStreaming: false,
        error: null,
      });
    });

    it('initChat does not overwrite existing state', () => {
      useCardStore.getState().initChat('card-1');
      useCardStore.getState().setChatMessages('card-1', () => [
        {
          id: '1',
          role: 'user',
          content: 'hi',
          toolCall: null,
          timestamp: '2024-01-01',
          status: 'complete',
        },
      ]);
      useCardStore.getState().initChat('card-1');
      const chat = useCardStore.getState().chatStates.get('card-1');
      expect(chat?.messages).toHaveLength(1);
    });

    it('clearChat removes chat state', () => {
      useCardStore.getState().initChat('card-1');
      useCardStore.getState().clearChat('card-1');
      expect(useCardStore.getState().chatStates.has('card-1')).toBe(false);
    });

    it('setChatIsStreaming updates streaming flag', () => {
      useCardStore.getState().initChat('card-1');
      useCardStore.getState().setChatIsStreaming('card-1', true);
      expect(useCardStore.getState().chatStates.get('card-1')?.isStreaming).toBe(true);
    });

    it('setChatError updates error field', () => {
      useCardStore.getState().initChat('card-1');
      useCardStore.getState().setChatError('card-1', 'Something failed');
      expect(useCardStore.getState().chatStates.get('card-1')?.error).toBe('Something failed');
    });
  });
});
