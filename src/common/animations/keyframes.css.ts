import { keyframes, style } from '@vanilla-extract/css';
import { easingCSS } from './easing';

export const shimmerKeyframes = keyframes({
  '0%': { transform: 'translateX(-100%)' },
  '100%': { transform: 'translateX(100%)' },
});

export const pulseKeyframes = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.4 },
});

export const spinKeyframes = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

export const fadeInUpKeyframes = keyframes({
  '0%': { opacity: 0, transform: 'translateY(8px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

export const shimmer = style({
  animation: `${shimmerKeyframes} 1.5s linear infinite`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});

export const pulse = style({
  animation: `${pulseKeyframes} 1.5s ease-in-out infinite`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});

export const spin = style({
  animation: `${spinKeyframes} 0.8s linear infinite`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});

export const fadeInUp = style({
  animation: `${fadeInUpKeyframes} 300ms ${easingCSS.outQuart} forwards`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});
