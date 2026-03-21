import { style } from '@vanilla-extract/css';
import { vars } from '@/theme';

export const shell = style({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  backgroundColor: vars.color.bg,
  fontFamily: vars.font.sans,
});

export const header = style({
  height: '56px',
  flexShrink: 0,
  position: 'sticky',
  top: 0,
  zIndex: 10,
  backgroundColor: vars.color.surface,
  borderBottom: `1px solid ${vars.color.border}`,
});

export const toolbar = style({
  height: '64px',
  flexShrink: 0,
  backgroundColor: vars.color.bg,
  borderBottom: `1px solid ${vars.color.border}`,
});

export const content = style({
  display: 'flex',
  flex: 1,
  overflow: 'hidden',
});

export const main = style({
  flex: 1,
  overflowY: 'auto',
  padding: '0 24px',
});
