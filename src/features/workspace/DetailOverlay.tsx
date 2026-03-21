import { useEffect, useCallback, type ReactNode } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { easingMotion } from '@/common/animations/easing';
import { useDetailCardId } from './store/selectors';
import { useSessionStore } from './store/sessionStore';
import { backdrop, detailPanel } from './DetailOverlay.css';

export interface DetailOverlayProps {
  /** Render callback for detail content */
  renderDetail?: (cardId: string) => ReactNode;
}

export function DetailOverlay({ renderDetail }: DetailOverlayProps) {
  const detailCardId = useDetailCardId();
  const closeDetail = useSessionStore((s) => s.closeDetail);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      // Only close if clicking the backdrop itself, not the panel
      if (e.target === e.currentTarget) {
        closeDetail();
      }
    },
    [closeDetail]
  );

  // Escape key handler
  useEffect(() => {
    if (!detailCardId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDetail();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [detailCardId, closeDetail]);

  return (
    <AnimatePresence>
      {detailCardId && (
        <m.div
          className={backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: easingMotion.inOut }}
          onClick={handleBackdropClick}
          data-testid="detail-backdrop"
        >
          <m.div
            className={detailPanel}
            layoutId={detailCardId}
            initial={{ borderRadius: 8 }}
            animate={{ borderRadius: 12 }}
            transition={{ duration: 0.3, ease: easingMotion.outQuart }}
            role="dialog"
            aria-label="Card detail view"
            data-testid="detail-panel"
          >
            {renderDetail
              ? renderDetail(detailCardId)
              : (
                <div style={{ padding: '24px' }}>
                  <p>Detail View: {detailCardId}</p>
                </div>
              )}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
