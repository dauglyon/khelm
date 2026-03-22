import { style } from '@vanilla-extract/css';
import { vars } from '@/theme';

export const checkboxLabel = style({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  cursor: 'pointer',
  userSelect: 'none',
});

export const hiddenInput = style({
  position: 'absolute',
  opacity: 0,
  width: 0,
  height: 0,
  margin: 0,
  padding: 0,
  overflow: 'hidden',
});

export const indicator = style({
  width: '18px',
  height: '18px',
  borderRadius: '4px',
  border: `1px solid ${vars.color.border}`,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  transition: 'background-color 150ms, border-color 150ms',
  backgroundColor: vars.color.surface,
});

export const indicatorChecked = style({
  backgroundColor: vars.color.text,
  borderColor: vars.color.text,
  color: vars.color.surface,
});

export const disabledStyle = style({
  opacity: 0.5,
  cursor: 'not-allowed',
});

export const labelText = style({
  fontSize: '15px',
  fontWeight: 400,
  lineHeight: 1.5,
  fontFamily: vars.font.sans,
  marginLeft: '8px',
  color: vars.color.text,
});

export const focusRing = style({
  selectors: {
    [`${hiddenInput}:focus-visible + &`]: {
      outline: `2px solid ${vars.color.text}`,
      outlineOffset: '2px',
    },
  },
});
