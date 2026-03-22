import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '@/theme';

export const wrapper = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: '6px',
  transition: 'border-color 150ms, outline 150ms',
  outline: 'none',
});

export const wrapperFocused = style({
  selectors: {
    '&:focus-within': {
      outline: `2px solid ${vars.color.text}`,
      outlineOffset: '2px',
    },
  },
});

export const wrapperError = style({
  borderColor: vars.color.status.error,
});

export const wrapperSizeVariants = styleVariants({
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

export const inputElement = style({
  border: 'none',
  outline: 'none',
  background: 'transparent',
  flex: 1,
  minWidth: 0,
  fontSize: 'inherit',
  fontFamily: 'inherit',
  lineHeight: 'inherit',
  color: vars.color.text,
  padding: '0 10px',
  height: '100%',
  '::placeholder': {
    color: vars.color.textLight,
  },
});

export const adornment = style({
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  color: vars.color.textMid,
});

export const prefixStyle = style({
  paddingLeft: '10px',
});

export const suffixStyle = style({
  paddingRight: '10px',
});

export const wrapperDisabled = style({
  opacity: 0.5,
  pointerEvents: 'none',
  cursor: 'not-allowed',
});

export const errorMessage = style({
  color: vars.color.status.error,
  fontSize: '11px',
  fontWeight: 500,
  lineHeight: 1.4,
  fontFamily: vars.font.sans,
  marginTop: '4px',
});
