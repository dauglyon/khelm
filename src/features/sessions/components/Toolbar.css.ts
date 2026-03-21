import { style } from '@vanilla-extract/css';
import { vars } from '@/theme';

export const toolbarContainer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '100%',
  padding: '0 24px',
  fontFamily: vars.font.sans,
});

export const inputPlaceholder = style({
  fontSize: '14px',
  color: vars.color.textLight,
});
