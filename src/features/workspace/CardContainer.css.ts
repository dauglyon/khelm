import { style } from '@vanilla-extract/css';
import { vars } from '@/theme';

export const cardContainer = style({
  boxSizing: 'border-box',
});

export const activeCardStyle = style({
  outline: `2px solid ${vars.color.inputType.sql.fg}`,
  outlineOffset: '2px',
  borderRadius: '8px',
});
