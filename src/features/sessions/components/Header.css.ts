import { style } from '@vanilla-extract/css';
import { vars } from '@/theme';

export const headerContainer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '100%',
  padding: '0 24px',
  fontFamily: vars.font.sans,
});

export const logoText = style({
  fontSize: '18px',
  fontWeight: 600,
  color: vars.color.text,
});

export const titleText = style({
  fontSize: '16px',
  fontWeight: 500,
  color: vars.color.text,
});

export const avatarPlaceholder = style({
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  backgroundColor: vars.color.border,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.color.textMid,
  fontSize: '14px',
});
