/**
 * Hook that guards edit/delete actions behind lock check.
 * Provides canEdit status and an onEditAttempt handler for denied-click toast.
 *
 * Architecture reference: collaboration.md section 6.
 */

import { useCallback, useRef } from 'react';
import {
  useIsCardLocked,
  useIsCardLockedByMe,
  useLockHolder,
} from '../collaborationStore';

const TOAST_DURATION_MS = 3000;

export interface CardLockGuardResult {
  isLocked: boolean;
  isLockedByMe: boolean;
  canEdit: boolean;
  lockHolder: { name: string; role: 'human' | 'ai' } | null;
  onEditAttempt: () => void;
  toastMessage: string | null;
  dismissToast: () => void;
}

/**
 * Guards card edit/delete/configure actions behind lock checks.
 * Returns canEdit status and an onEditAttempt callback that
 * triggers an inline toast when the card is locked by someone else.
 */
export function useCardLockGuard(
  cardId: string,
  onToast?: (message: string) => void
): CardLockGuardResult {
  const isLocked = useIsCardLocked(cardId);
  const isLockedByMe = useIsCardLockedByMe(cardId);
  const lockHolder = useLockHolder(cardId);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canEdit = !isLocked || isLockedByMe;

  const onEditAttempt = useCallback(() => {
    if (isLocked && !isLockedByMe && lockHolder) {
      const message = `This card is being edited by ${lockHolder.name}.`;
      onToast?.(message);

      // Auto-dismiss after 3 seconds
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      toastTimerRef.current = setTimeout(() => {
        toastTimerRef.current = null;
      }, TOAST_DURATION_MS);
    }
  }, [isLocked, isLockedByMe, lockHolder, onToast]);

  const dismissToast = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  }, []);

  return {
    isLocked,
    isLockedByMe,
    canEdit,
    lockHolder,
    onEditAttempt,
    toastMessage: null,
    dismissToast,
  };
}
