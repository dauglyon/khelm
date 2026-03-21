import { memo, useCallback, type CSSProperties, type ReactNode } from 'react';
import { m, useReducedMotion } from 'motion/react';
import { easingMotion } from '@/common/animations/easing';
import { useIsFirstRender, useActiveCardId } from './store/selectors';
import { useSessionStore } from './store/sessionStore';
import { cardContainer, activeCardStyle } from './CardContainer.css';

export interface CardContainerProps {
  /** Unique card identifier */
  cardId: string;
  /** Position/size from virtualizer (top, left, width) */
  style: CSSProperties;
  /** Ref callback for height measurement */
  onMeasure: (el: HTMLElement | null) => void;
  /** Total number of cards (for aria-setsize) */
  totalCount: number;
  /** 0-based index in order array */
  orderIndex: number;
  /** The card component to render inside */
  children: ReactNode;
}

/** Enter animation duration in seconds */
const ENTER_DURATION = 0.3;

export const CardContainer = memo(function CardContainer({
  cardId,
  style: positionStyle,
  onMeasure,
  totalCount,
  orderIndex,
  children,
}: CardContainerProps) {
  const isFirstRender = useIsFirstRender(cardId);
  const activeCardId = useActiveCardId();
  const isActive = activeCardId === cardId;
  const reducedMotion = useReducedMotion();
  const markRendered = useSessionStore((s) => s.markRendered);

  const measureRef = useCallback(
    (el: HTMLElement | null) => {
      if (el) onMeasure(el);
    },
    [onMeasure]
  );

  const handleAnimationComplete = useCallback(() => {
    markRendered(cardId);
  }, [markRendered, cardId]);

  // Determine animation props
  const shouldAnimate = isFirstRender && !reducedMotion;

  const classes = [cardContainer, isActive ? activeCardStyle : undefined]
    .filter(Boolean)
    .join(' ');

  return (
    <m.div
      ref={measureRef}
      className={classes}
      style={positionStyle}
      layoutId={cardId}
      role="listitem"
      aria-setsize={totalCount}
      aria-posinset={orderIndex + 1}
      aria-current={isActive ? 'true' : undefined}
      data-card-id={cardId}
      data-index={orderIndex}
      initial={
        shouldAnimate ? { opacity: 0, y: 20 } : false
      }
      animate={{ opacity: 1, y: 0 }}
      transition={
        shouldAnimate
          ? { duration: ENTER_DURATION, ease: easingMotion.outQuart }
          : { duration: 0 }
      }
      onAnimationComplete={
        isFirstRender ? handleAnimationComplete : undefined
      }
    >
      {children}
    </m.div>
  );
});
