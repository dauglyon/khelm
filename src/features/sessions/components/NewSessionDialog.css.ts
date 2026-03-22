import { style } from '@vanilla-extract/css';
import { vars } from '@/theme';

export const dialogContainer = style({
  maxWidth: '400px',
  margin: '0 auto',
  padding: '32px 24px',
  fontFamily: vars.font.sans,
});

export const dialogTitle = style({
  fontSize: '20px',
  fontWeight: 600,
  color: vars.color.text,
  marginBottom: '24px',
});

export const form = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

export const label = style({
  display: 'block',
  fontSize: '14px',
  fontWeight: 500,
  color: vars.color.textMid,
  marginBottom: '4px',
});

export const buttonRow = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '8px',
  marginTop: '8px',
});

export const errorText = style({
  fontSize: '14px',
  color: vars.color.status.error,
});
