import { style } from '@vanilla-extract/css';
import { vars } from '@/theme';

export const sidebar = style({
  width: '320px',
  flexShrink: 0,
  overflow: 'hidden',
  backgroundColor: vars.color.surface,
  borderLeft: `1px solid ${vars.color.border}`,
});

export const sidebarContent = style({
  padding: '24px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  fontFamily: vars.font.sans,
});

export const sectionHeading = style({
  fontSize: '14px',
  fontWeight: 600,
  color: vars.color.textMid,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
});
