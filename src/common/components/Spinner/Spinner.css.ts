import { style, styleVariants } from '@vanilla-extract/css';
import { spinKeyframes } from '@/common/animations';

export const spinnerBase = style({
  display: 'inline-block',
  animation: `${spinKeyframes} 0.8s linear infinite`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animationDuration: '0.01ms',
      animationIterationCount: '1',
    },
  },
});

export const spinnerSizes = styleVariants({
  16: { width: 16, height: 16 },
  20: { width: 20, height: 20 },
  24: { width: 24, height: 24 },
});
