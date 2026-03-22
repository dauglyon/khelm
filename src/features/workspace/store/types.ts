/**
 * Type definitions for the workspace session store.
 *
 * CardType uses snake_case to match the architecture spec ('data_ingest'),
 * while the design-system InputType uses camelCase ('dataIngest').
 * A mapping utility is provided for bridging the two.
 */

export type CardType =
  | 'sql'
  | 'python'
  | 'literature'
  | 'note'
  | 'data_ingest';

export type CardStatus = 'thinking' | 'running' | 'complete' | 'error';

export interface CardState {
  id: string;
  shortname: string;
  type: CardType;
  status: CardStatus;
  content: string;
  input: string;
  references: string[];
  referencedBy: string[];
  createdAt: number;
  updatedAt: number;
}

export interface SessionState {
  /** All cards in the session, keyed by ID */
  cards: Map<string, CardState>;
  /** Card IDs in display order (masonry reads this) */
  order: string[];
  /** Currently selected/focused card */
  activeCardId: string | null;
  /** Card shown in detail view (drives layoutId transition) */
  detailCardId: string | null;
  /** Ephemeral token buffers per streaming card; flushed to cards at interval */
  streamBuffers: Map<string, string>;
  /** Tracks which cards have been rendered (for enter animation gating) */
  renderedCardIds: Set<string>;
}

export interface SessionActions {
  /** Adds to cards map, appends ID to order */
  addCard: (card: CardState) => void;
  /** Removes from cards, order, streamBuffers, renderedCardIds; cleans up references */
  removeCard: (id: string) => void;
  /** Shallow merges patch into card state */
  updateCard: (id: string, patch: Partial<CardState>) => void;
  /** Moves ID within order array */
  reorderCards: (fromIndex: number, toIndex: number) => void;
  /** Sets activeCardId */
  setActiveCard: (id: string | null) => void;
  /** Sets detailCardId, triggering layoutId transition */
  openDetail: (id: string) => void;
  /** Clears detailCardId */
  closeDetail: () => void;
  /** Appends buffer contents to card's content, clears buffer */
  flushStreamBuffer: (id: string) => void;
  /** Adds ID to renderedCardIds */
  markRendered: (id: string) => void;
}

export type SessionStore = SessionState & SessionActions;
