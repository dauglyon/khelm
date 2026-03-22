import { style, keyframes } from '@vanilla-extract/css';
import { vars } from '@/theme';

export const indicatorWrapper = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const blinkKeyframes = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.4 },
});

const spinKeyframes = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

export const dotBase = style({
  borderRadius: '50%',
  flexShrink: 0,
});

export const dotSm = style({ width: '12px', height: '12px' });
export const dotMd = style({ width: '16px', height: '16px' });

export const thinkingDot = style({
  backgroundColor: vars.color.status.thinking,
  animation: `${blinkKeyframes} 1.5s ease-in-out infinite`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});

export const runningSpinner = style({
  border: '2px solid transparent',
  borderTopColor: vars.color.status.running,
  borderRightColor: vars.color.status.running,
  animation: `${spinKeyframes} 0.8s linear infinite`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
      borderColor: vars.color.status.running,
    },
  },
});

export const completeIcon = style({
  color: vars.color.status.complete,
});

export const errorIcon = style({
  color: vars.color.status.error,
});
