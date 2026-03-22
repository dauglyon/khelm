import { style, styleVariants, globalStyle } from '@vanilla-extract/css';
import { vars } from '@/theme';
import { pulseKeyframes } from '@/common/animations/keyframes.css';

export const badgeBase = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
});

export const dot = style({
  borderRadius: '50%',
  flexShrink: 0,
});

export const dotColorVariants = styleVariants({
  thinking: { backgroundColor: vars.color.status.thinking },
  queued: { backgroundColor: vars.color.status.queued },
  running: { backgroundColor: vars.color.status.running },
  complete: { backgroundColor: vars.color.status.complete },
  error: { backgroundColor: vars.color.status.error },
});

export const badgeSizeVariants = styleVariants({
  sm: {},
  md: {},
});

globalStyle(`.${badgeSizeVariants.sm} .${dot}`, {
  width: '6px',
  height: '6px',
});

globalStyle(`.${badgeSizeVariants.md} .${dot}`, {
  width: '8px',
  height: '8px',
});

export const dotPulse = style({
  animation: `${pulseKeyframes} 1.5s ease-in-out infinite`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animationDuration: '0.01ms',
      animationIterationCount: '1',
    },
  },
});

export const labelStyle = style({
  fontWeight: 400,
  lineHeight: 1.5,
  fontFamily: vars.font.sans,
  color: vars.color.textMid,
});

globalStyle(`.${badgeSizeVariants.sm} .${labelStyle}`, {
  fontSize: '11px',
});

globalStyle(`.${badgeSizeVariants.md} .${labelStyle}`, {
  fontSize: '13px',
});
