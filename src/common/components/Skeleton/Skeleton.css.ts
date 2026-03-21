import { style } from '@vanilla-extract/css';
import { vars } from '@/theme';
import { shimmerKeyframes } from '@/common/animations/keyframes.css';

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
    background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
    animation: `${shimmerKeyframes} 1.5s linear infinite`,
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      '::after': {
        animation: 'none',
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
