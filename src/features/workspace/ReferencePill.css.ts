import { style } from '@vanilla-extract/css';
import { vars } from '@/theme';

export const pillButton = style({
  all: 'unset',
  display: 'inline',
  cursor: 'pointer',
  ':focus-visible': {
    outline: `2px solid ${vars.color.inputType.sql.fg}`,
    outlineOffset: '1px',
    borderRadius: '9999px',
  },
});

export const deletedPill = style({
  textDecoration: 'line-through',
  opacity: 0.5,
  cursor: 'default',
});
