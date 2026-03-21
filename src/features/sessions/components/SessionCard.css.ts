import { style } from '@vanilla-extract/css';
import { vars } from '@/theme';

export const card = style({
  padding: '20px',
  backgroundColor: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
  ':hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    borderColor: vars.color.textLight,
  },
  fontFamily: vars.font.sans,
});

export const cardTitle = style({
  fontSize: '16px',
  fontWeight: 600,
  color: vars.color.text,
  marginBottom: '8px',
  lineHeight: '1.3',
});

export const cardMeta = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '13px',
  color: vars.color.textLight,
});

export const memberCount = style({
  fontSize: '12px',
  color: vars.color.textMid,
  fontWeight: 500,
});
