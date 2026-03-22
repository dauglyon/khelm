import { style } from '@vanilla-extract/css';
import { vars } from '@/theme';

export const headerContainer = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 16px',
});

export const shortnameText = style({
  flex: 1,
  fontSize: '15px',
  fontWeight: 600,
  fontFamily: vars.font.sans,
  color: vars.color.text,
  cursor: 'pointer',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  border: 'none',
  background: 'none',
  padding: 0,
  margin: 0,
  textAlign: 'left',
  lineHeight: 1.5,
});

export const shortnameInput = style({
  flex: 1,
  fontSize: '15px',
  fontWeight: 600,
  fontFamily: vars.font.sans,
  color: vars.color.text,
  backgroundColor: 'transparent',
  border: 'none',
  outline: 'none',
  padding: 0,
  margin: 0,
  lineHeight: 1.5,
  width: '100%',
  selectors: {
    '&:focus': {
      outline: `2px solid ${vars.color.status.running}`,
      outlineOffset: '2px',
      borderRadius: '2px',
    },
  },
});

export const actionsContainer = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  opacity: 0,
  transition: 'opacity 150ms ease',
  selectors: {
    [`${headerContainer}:hover &`]: {
      opacity: 1,
    },
    [`${headerContainer}:focus-within &`]: {
      opacity: 1,
    },
  },
});

export const deleteConfirm = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '12px',
  fontFamily: vars.font.sans,
  color: vars.color.status.error,
});
