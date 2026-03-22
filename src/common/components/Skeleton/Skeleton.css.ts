import { style } from '@vanilla-extract/css';
import { vars } from '@/theme';
import { shimmerKeyframes } from '@/common/animations';

export const skeletonBase = style({
  backgroundColor: vars.color.border,
  borderRadius: '4px',
  overflow: 'hidden',
  position: 'relative',
  '::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // Pragmatic exception: shimmer highlight requires a semi-transparent white that cannot be expressed as a theme token.
    background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
    animation: `${shimmerKeyframes} 1.5s linear infinite`,
  },
  // The ::after pseudo-element must be nested inside the @media block because
  // vanilla-extract does not support top-level pseudo-element overrides within
  // a @media rule; nesting here ensures the shimmer animation is disabled for
  // users who have requested reduced motion.
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      '::after': {
        animationDuration: '0.01ms',
        animationIterationCount: '1',
      },
    },
  },
});

export const skeletonCircle = style({
  borderRadius: '50%',
});

export const skeletonLine = style({
  marginBottom: '8px',
  selectors: {
    '&:last-child': {
      marginBottom: 0,
    },
  },
});
