import { style, keyframes } from '@vanilla-extract/css';
import { vars } from '@/theme';

export const cardBody = style({
  position: 'relative',
  minHeight: '40px',
});

const shimmerMove = keyframes({
  '0%': { transform: 'translateX(-100%)' },
  '100%': { transform: 'translateX(100%)' },
});

export const shimmerOverlay = style({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'hidden',
  borderRadius: '0 0 8px 8px',
  pointerEvents: 'none',
  '::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(90deg, transparent, ${vars.color.border}33, transparent)`,
    animation: `${shimmerMove} 1.5s linear infinite`,
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      '::after': {
        animation: 'none',
      },
    },
  },
});

export const cardWithChat = style({
  display: 'flex',
});

export const cardMainContent = style({
  flex: 1,
  minWidth: 0,
});

export const errorBoundaryFallback = style({
  padding: '16px',
  color: vars.color.status.error,
  fontSize: '13px',
  fontFamily: vars.font.sans,
});
