import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '@/theme';

export const inputWrapper = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: '6px', // Component-internal spacing, not in token scale
  transition: 'border-color 150ms, outline 150ms', // Shared transition duration, not yet a token
  outline: 'none',
});

export const inputWrapperFocused = style({
  selectors: {
    '&:has(:focus-visible)': {
      outline: `2px solid ${vars.color.text}`,
      outlineOffset: '2px',
    },
  },
});

export const inputWrapperError = style({
  borderColor: vars.color.status.error,
});

export const inputWrapperSizeVariants = styleVariants({
  sm: {
    height: '32px',
    fontSize: '13px',
    fontFamily: vars.font.sans,
    lineHeight: 1.5,
  },
  md: {
    height: '40px',
    fontSize: '15px',
    fontFamily: vars.font.sans,
    lineHeight: 1.5,
  },
});

export const inputWrapperDisabled = style({
  opacity: 0.5,
  pointerEvents: 'none',
  cursor: 'not-allowed',
});

export const inputErrorMessage = style({
  color: vars.color.status.error,
  fontSize: '11px',
  fontWeight: 500,
  lineHeight: 1.4,
  fontFamily: vars.font.sans,
  marginTop: '4px',
});
