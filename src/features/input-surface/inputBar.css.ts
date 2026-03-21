import { style } from '@vanilla-extract/css';
import { vars } from '@/theme';

export const inputBarWrapper = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  width: '100%',
  padding: '8px 12px',
  background: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  fontFamily: vars.font.sans,
  boxSizing: 'border-box',
});

export const submitButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  border: 'none',
  background: vars.color.text,
  color: vars.color.surface,
  cursor: 'pointer',
  flexShrink: 0,
  transition: `opacity 150ms ${vars.easing.inOut}`,
  selectors: {
    '&:disabled': {
      opacity: 0.3,
      cursor: 'not-allowed',
    },
    '&:hover:not(:disabled)': {
      opacity: 0.85,
    },
  },
});
