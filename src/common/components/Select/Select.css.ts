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
  position: 'relative',
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

export const selectElement = style({
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
  cursor: 'pointer',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  appearance: 'none',
});

export const chevronWrapper = style({
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  color: vars.color.textMid,
  paddingRight: '10px',
  pointerEvents: 'none',
});

export const errorMessage = style({
  color: vars.color.status.error,
  fontSize: '11px',
  fontWeight: 500,
  lineHeight: 1.4,
  fontFamily: vars.font.sans,
  marginTop: '4px',
});
