// Components
export { WorkspacePanel } from './WorkspacePanel';
export type { WorkspacePanelProps } from './WorkspacePanel';
export { MasonryGrid } from './MasonryGrid';
export type { MasonryGridProps, MasonryGridHandle } from './MasonryGrid';
export { CardContainer } from './CardContainer';
export type { CardContainerProps } from './CardContainer';
export { DetailOverlay } from './DetailOverlay';
export type { DetailOverlayProps } from './DetailOverlay';
export { ReferencePill } from './ReferencePill';
export type { ReferencePillProps } from './ReferencePill';

// Store (re-export all public API)
export {
  useSessionStore,
  sessionVanillaStore,
  useCard,
  useCardOrder,
  useActiveCardId,
  useDetailCardId,
  useCardShortname,
  useIsFirstRender,
  useSessionActions,
} from './store';
export type {
  CardType,
  CardStatus,
  CardState,
  SessionState,
  SessionActions,
  SessionStore,
} from './store';

// Hooks
export { useColumnCount } from './hooks/useColumnCount';
export { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
export { useScrollToCard } from './hooks/useScrollToCard';
