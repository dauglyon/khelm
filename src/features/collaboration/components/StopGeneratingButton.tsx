/**
 * "Stop generating" button for AI-locked cards.
 * Triggers preemption: aborts AI stream, saves partial content, transfers lock.
 *
 * Architecture reference: collaboration.md section 8.
 */

import { useAIPreemption } from '../useAIPreemption';
import { useLock } from '../collaborationStore';
import { stopButton, stopIcon } from './StopGeneratingButton.css';

export interface StopGeneratingButtonProps {
  cardId: string;
}

export function StopGeneratingButton({ cardId }: StopGeneratingButtonProps) {
  const lock = useLock(cardId);
  const { canPreempt, preempt, isPreempting } = useAIPreemption(cardId);

  // Only show when card is locked by AI
  if (!lock || lock.holderRole !== 'ai') {
    return null;
  }

  return (
    <button
      type="button"
      className={stopButton}
      onClick={preempt}
      disabled={!canPreempt || isPreempting}
      aria-label="Stop generating"
      data-testid={`stop-generating-${cardId}`}
    >
      <span className={stopIcon} aria-hidden="true" />
      {isPreempting ? 'Stopping...' : 'Stop generating'}
    </button>
  );
}
