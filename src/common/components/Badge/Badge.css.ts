import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '@/theme';
import { pulseKeyframes } from '@/common/animations/keyframes.css';

export const badgeBase = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
});

export const dot = style({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  flexShrink: 0,
});

export const dotColorVariants = styleVariants({
  thinking: { backgroundColor: vars.color.status.thinking },
  running: { backgroundColor: vars.color.status.running },
  complete: { backgroundColor: vars.color.status.complete },
  error: { backgroundColor: vars.color.status.error },
});

export const dotPulse = style({
  animation: `${pulseKeyframes} 1.5s ease-in-out infinite`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});

export const labelStyle = style({
  fontSize: '13px',
  fontWeight: 400,
  lineHeight: 1.5,
  fontFamily: vars.font.sans,
  color: vars.color.textMid,
});
