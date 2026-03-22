import { AnimatePresence, m } from 'motion/react';
import { Icon } from '@/common/components/Icon';
import type { CardStatus } from './types';
import {
  indicatorWrapper,
  dotBase,
  dotSm,
  dotMd,
  thinkingDot,
  runningSpinner,
  completeIcon,
  errorIcon,
} from './StatusIndicator.css';

export interface StatusIndicatorProps {
  status: CardStatus;
  size?: 'sm' | 'md';
}

const transitionConfig = {
  duration: 0.2,
  ease: [0.16, 1, 0.3, 1] as const,
};

export function StatusIndicator({
  status,
  size = 'md',
}: StatusIndicatorProps) {
  const sizeClass = size === 'sm' ? dotSm : dotMd;
  const iconSize = size === 'sm' ? 12 : 16;

  return (
    <span
      className={indicatorWrapper}
      aria-label={`Status: ${status}`}
      role="status"
    >
      <AnimatePresence mode="wait">
        {status === 'thinking' && (
          <m.span
            key="thinking"
            className={`${dotBase} ${sizeClass} ${thinkingDot}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={transitionConfig}
            data-testid="status-thinking"
          />
        )}

        {status === 'running' && (
          <m.span
            key="running"
            className={`${dotBase} ${sizeClass} ${runningSpinner}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={transitionConfig}
            data-testid="status-running"
          />
        )}

        {status === 'complete' && (
          <m.span
            key="complete"
            className={completeIcon}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              ...transitionConfig,
              type: 'spring',
              stiffness: 300,
              damping: 20,
            }}
            data-testid="status-complete"
          >
            <Icon name="check" size={iconSize as 16 | 20 | 24} />
          </m.span>
        )}

        {status === 'error' && (
          <m.span
            key="error"
            className={errorIcon}
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: [0, -3, 3, -2, 2, 0] }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: transitionConfig,
              x: { duration: 0.3, ease: 'easeInOut' },
            }}
            data-testid="status-error"
          >
            <Icon name="alert-circle" size={iconSize as 16 | 20 | 24} />
          </m.span>
        )}
      </AnimatePresence>
    </span>
  );
}
