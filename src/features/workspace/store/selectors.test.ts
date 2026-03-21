import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSessionStore } from './sessionStore';
import {
  useCard,
  useCardOrder,
  useActiveCardId,
  useDetailCardId,
  useCardShortname,
  useIsFirstRender,
} from './selectors';
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

describe('selectors', () => {
  beforeEach(() => {
    useSessionStore.setState({
      cards: new Map(),
      order: [],
      activeCardId: null,
      detailCardId: null,
      streamBuffers: new Map(),
      renderedCardIds: new Set(),
    });
  });

  describe('useCard', () => {
    it('returns correct card state', () => {
      const card = makeCard();
      act(() => {
        useSessionStore.getState().addCard(card);
      });
      const { result } = renderHook(() => useCard('card-1'));
      expect(result.current?.shortname).toBe('q1');
    });

    it('returns undefined for nonexistent card', () => {
      const { result } = renderHook(() => useCard('nonexistent'));
      expect(result.current).toBeUndefined();
    });

    it('updates when card state changes', () => {
      act(() => {
        useSessionStore.getState().addCard(makeCard({ content: 'old' }));
      });
      const { result } = renderHook(() => useCard('card-1'));
      expect(result.current?.content).toBe('old');

      act(() => {
        useSessionStore.getState().updateCard('card-1', { content: 'new' });
      });
      expect(result.current?.content).toBe('new');
    });
  });

  describe('useCardOrder', () => {
    it('returns order array', () => {
      act(() => {
        useSessionStore.getState().addCard(makeCard({ id: 'a' }));
        useSessionStore.getState().addCard(makeCard({ id: 'b' }));
      });
      const { result } = renderHook(() => useCardOrder());
      expect(result.current).toEqual(['a', 'b']);
    });

    it('updates when order changes', () => {
      act(() => {
        useSessionStore.getState().addCard(makeCard({ id: 'a' }));
        useSessionStore.getState().addCard(makeCard({ id: 'b' }));
      });
      const { result } = renderHook(() => useCardOrder());
      act(() => {
        useSessionStore.getState().reorderCards(0, 1);
      });
      expect(result.current).toEqual(['b', 'a']);
    });
  });

  describe('useActiveCardId', () => {
    it('returns null initially', () => {
      const { result } = renderHook(() => useActiveCardId());
      expect(result.current).toBeNull();
    });

    it('returns active card ID when set', () => {
      act(() => {
        useSessionStore.getState().setActiveCard('card-1');
      });
      const { result } = renderHook(() => useActiveCardId());
      expect(result.current).toBe('card-1');
    });
  });

  describe('useDetailCardId', () => {
    it('returns null initially', () => {
      const { result } = renderHook(() => useDetailCardId());
      expect(result.current).toBeNull();
    });

    it('returns detail card ID when set', () => {
      act(() => {
        useSessionStore.getState().openDetail('card-1');
      });
      const { result } = renderHook(() => useDetailCardId());
      expect(result.current).toBe('card-1');
    });

    it('returns null after closeDetail', () => {
      act(() => {
        useSessionStore.getState().openDetail('card-1');
      });
      const { result } = renderHook(() => useDetailCardId());
      act(() => {
        useSessionStore.getState().closeDetail();
      });
      expect(result.current).toBeNull();
    });
  });

  describe('useCardShortname', () => {
    it('returns the shortname string', () => {
      act(() => {
        useSessionStore.getState().addCard(makeCard({ shortname: 'q1' }));
      });
      const { result } = renderHook(() => useCardShortname('card-1'));
      expect(result.current).toBe('q1');
    });

    it('returns undefined for nonexistent card', () => {
      const { result } = renderHook(() => useCardShortname('nonexistent'));
      expect(result.current).toBeUndefined();
    });

    it('updates when shortname changes', () => {
      act(() => {
        useSessionStore.getState().addCard(makeCard({ shortname: 'q1' }));
      });
      const { result } = renderHook(() => useCardShortname('card-1'));
      act(() => {
        useSessionStore
          .getState()
          .updateCard('card-1', { shortname: 'sales_query' });
      });
      expect(result.current).toBe('sales_query');
    });
  });

  describe('useIsFirstRender', () => {
    it('returns true before markRendered', () => {
      act(() => {
        useSessionStore.getState().addCard(makeCard());
      });
      const { result } = renderHook(() => useIsFirstRender('card-1'));
      expect(result.current).toBe(true);
    });

    it('returns false after markRendered', () => {
      act(() => {
        useSessionStore.getState().addCard(makeCard());
      });
      const { result } = renderHook(() => useIsFirstRender('card-1'));
      act(() => {
        useSessionStore.getState().markRendered('card-1');
      });
      expect(result.current).toBe(false);
    });
  });
});
