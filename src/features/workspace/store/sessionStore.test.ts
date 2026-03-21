import { describe, it, expect, beforeEach } from 'vitest';
import { useSessionStore, sessionVanillaStore } from './sessionStore';
import type { CardState } from './types';

function makeCard(overrides: Partial<CardState> = {}): CardState {
  return {
    id: 'card-1',
    shortname: 'q1',
    type: 'sql',
    status: 'complete',
    content: '',
    input: 'SELECT * FROM taxa',
    references: [],
    referencedBy: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

describe('sessionStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useSessionStore.setState({
      cards: new Map(),
      order: [],
      activeCardId: null,
      detailCardId: null,
      streamBuffers: new Map(),
      renderedCardIds: new Set(),
    });
  });

  describe('initial state', () => {
    it('starts with empty cards map', () => {
      const { cards } = useSessionStore.getState();
      expect(cards.size).toBe(0);
    });

    it('starts with empty order array', () => {
      const { order } = useSessionStore.getState();
      expect(order).toEqual([]);
    });

    it('starts with null activeCardId', () => {
      const { activeCardId } = useSessionStore.getState();
      expect(activeCardId).toBeNull();
    });

    it('starts with null detailCardId', () => {
      const { detailCardId } = useSessionStore.getState();
      expect(detailCardId).toBeNull();
    });

    it('starts with empty streamBuffers', () => {
      const { streamBuffers } = useSessionStore.getState();
      expect(streamBuffers.size).toBe(0);
    });

    it('starts with empty renderedCardIds', () => {
      const { renderedCardIds } = useSessionStore.getState();
      expect(renderedCardIds.size).toBe(0);
    });
  });

  describe('addCard', () => {
    it('adds card to cards map', () => {
      const card = makeCard();
      useSessionStore.getState().addCard(card);
      const { cards } = useSessionStore.getState();
      expect(cards.get('card-1')).toEqual(card);
    });

    it('appends card ID to order', () => {
      const card = makeCard();
      useSessionStore.getState().addCard(card);
      const { order } = useSessionStore.getState();
      expect(order).toEqual(['card-1']);
    });

    it('appends multiple cards in order', () => {
      useSessionStore.getState().addCard(makeCard({ id: 'a' }));
      useSessionStore.getState().addCard(makeCard({ id: 'b' }));
      useSessionStore.getState().addCard(makeCard({ id: 'c' }));
      const { order } = useSessionStore.getState();
      expect(order).toEqual(['a', 'b', 'c']);
    });
  });

  describe('removeCard', () => {
    it('removes card from cards map', () => {
      useSessionStore.getState().addCard(makeCard());
      useSessionStore.getState().removeCard('card-1');
      const { cards } = useSessionStore.getState();
      expect(cards.has('card-1')).toBe(false);
    });

    it('removes card ID from order', () => {
      useSessionStore.getState().addCard(makeCard({ id: 'a' }));
      useSessionStore.getState().addCard(makeCard({ id: 'b' }));
      useSessionStore.getState().removeCard('a');
      const { order } = useSessionStore.getState();
      expect(order).toEqual(['b']);
    });

    it('cleans up references bidirectionally', () => {
      const cardA = makeCard({ id: 'a', referencedBy: ['b'] });
      const cardB = makeCard({ id: 'b', references: ['a'] });
      useSessionStore.getState().addCard(cardA);
      useSessionStore.getState().addCard(cardB);

      useSessionStore.getState().removeCard('b');
      const { cards } = useSessionStore.getState();
      const updatedA = cards.get('a');
      expect(updatedA?.referencedBy).toEqual([]);
    });

    it('removes from streamBuffers', () => {
      useSessionStore.getState().addCard(makeCard());
      useSessionStore.setState({
        streamBuffers: new Map([['card-1', 'buffered']]),
      });
      useSessionStore.getState().removeCard('card-1');
      const { streamBuffers } = useSessionStore.getState();
      expect(streamBuffers.has('card-1')).toBe(false);
    });

    it('removes from renderedCardIds', () => {
      useSessionStore.getState().addCard(makeCard());
      useSessionStore.getState().markRendered('card-1');
      useSessionStore.getState().removeCard('card-1');
      const { renderedCardIds } = useSessionStore.getState();
      expect(renderedCardIds.has('card-1')).toBe(false);
    });

    it('clears activeCardId if it points to the removed card', () => {
      useSessionStore.getState().addCard(makeCard());
      useSessionStore.getState().setActiveCard('card-1');
      useSessionStore.getState().removeCard('card-1');
      const { activeCardId } = useSessionStore.getState();
      expect(activeCardId).toBeNull();
    });

    it('clears detailCardId if it points to the removed card', () => {
      useSessionStore.getState().addCard(makeCard());
      useSessionStore.getState().openDetail('card-1');
      useSessionStore.getState().removeCard('card-1');
      const { detailCardId } = useSessionStore.getState();
      expect(detailCardId).toBeNull();
    });
  });

  describe('updateCard', () => {
    it('shallow merges patch into card state', () => {
      useSessionStore.getState().addCard(makeCard({ content: 'old' }));
      useSessionStore.getState().updateCard('card-1', { content: 'new' });
      const card = useSessionStore.getState().cards.get('card-1');
      expect(card?.content).toBe('new');
    });

    it('preserves other fields when patching', () => {
      useSessionStore
        .getState()
        .addCard(makeCard({ content: 'old', shortname: 'q1' }));
      useSessionStore.getState().updateCard('card-1', { content: 'new' });
      const card = useSessionStore.getState().cards.get('card-1');
      expect(card?.shortname).toBe('q1');
    });

    it('does nothing for nonexistent card', () => {
      useSessionStore
        .getState()
        .updateCard('nonexistent', { content: 'new' });
      const { cards } = useSessionStore.getState();
      expect(cards.has('nonexistent')).toBe(false);
    });
  });

  describe('reorderCards', () => {
    it('moves card within order array', () => {
      useSessionStore.getState().addCard(makeCard({ id: 'a' }));
      useSessionStore.getState().addCard(makeCard({ id: 'b' }));
      useSessionStore.getState().addCard(makeCard({ id: 'c' }));
      useSessionStore.getState().reorderCards(0, 2);
      const { order } = useSessionStore.getState();
      expect(order).toEqual(['b', 'c', 'a']);
    });

    it('moves card from end to beginning', () => {
      useSessionStore.getState().addCard(makeCard({ id: 'a' }));
      useSessionStore.getState().addCard(makeCard({ id: 'b' }));
      useSessionStore.getState().addCard(makeCard({ id: 'c' }));
      useSessionStore.getState().reorderCards(2, 0);
      const { order } = useSessionStore.getState();
      expect(order).toEqual(['c', 'a', 'b']);
    });
  });

  describe('setActiveCard', () => {
    it('sets activeCardId', () => {
      useSessionStore.getState().setActiveCard('card-1');
      expect(useSessionStore.getState().activeCardId).toBe('card-1');
    });

    it('clears activeCardId with null', () => {
      useSessionStore.getState().setActiveCard('card-1');
      useSessionStore.getState().setActiveCard(null);
      expect(useSessionStore.getState().activeCardId).toBeNull();
    });
  });

  describe('openDetail / closeDetail', () => {
    it('sets detailCardId', () => {
      useSessionStore.getState().openDetail('card-1');
      expect(useSessionStore.getState().detailCardId).toBe('card-1');
    });

    it('clears detailCardId', () => {
      useSessionStore.getState().openDetail('card-1');
      useSessionStore.getState().closeDetail();
      expect(useSessionStore.getState().detailCardId).toBeNull();
    });
  });

  describe('flushStreamBuffer', () => {
    it('appends buffer contents to card content', () => {
      useSessionStore
        .getState()
        .addCard(makeCard({ content: 'Hello' }));
      useSessionStore.setState({
        streamBuffers: new Map([['card-1', ' World']]),
      });
      useSessionStore.getState().flushStreamBuffer('card-1');
      const card = useSessionStore.getState().cards.get('card-1');
      expect(card?.content).toBe('Hello World');
    });

    it('clears the buffer after flush', () => {
      useSessionStore
        .getState()
        .addCard(makeCard({ content: '' }));
      useSessionStore.setState({
        streamBuffers: new Map([['card-1', 'tokens']]),
      });
      useSessionStore.getState().flushStreamBuffer('card-1');
      const { streamBuffers } = useSessionStore.getState();
      expect(streamBuffers.has('card-1')).toBe(false);
    });

    it('does nothing if no buffer exists', () => {
      useSessionStore
        .getState()
        .addCard(makeCard({ content: 'original' }));
      useSessionStore.getState().flushStreamBuffer('card-1');
      const card = useSessionStore.getState().cards.get('card-1');
      expect(card?.content).toBe('original');
    });
  });

  describe('markRendered', () => {
    it('adds ID to renderedCardIds', () => {
      useSessionStore.getState().markRendered('card-1');
      const { renderedCardIds } = useSessionStore.getState();
      expect(renderedCardIds.has('card-1')).toBe(true);
    });

    it('is idempotent', () => {
      useSessionStore.getState().markRendered('card-1');
      useSessionStore.getState().markRendered('card-1');
      const { renderedCardIds } = useSessionStore.getState();
      expect(renderedCardIds.size).toBe(1);
    });
  });

  describe('vanilla store', () => {
    beforeEach(() => {
      sessionVanillaStore.setState({
        cards: new Map(),
        order: [],
        activeCardId: null,
        detailCardId: null,
        streamBuffers: new Map(),
        renderedCardIds: new Set(),
      });
    });

    it('is callable outside React', () => {
      const state = sessionVanillaStore.getState();
      expect(state.cards.size).toBe(0);
    });

    it('supports addCard via getState()', () => {
      sessionVanillaStore.getState().addCard(makeCard());
      const card = sessionVanillaStore.getState().cards.get('card-1');
      expect(card?.shortname).toBe('q1');
    });

    it('supports setState directly', () => {
      sessionVanillaStore.setState({ activeCardId: 'test' });
      expect(sessionVanillaStore.getState().activeCardId).toBe('test');
    });
  });
});
