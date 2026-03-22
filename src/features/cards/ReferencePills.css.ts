import { style } from '@vanilla-extract/css';
import { vars } from '@/theme';

export const pillsContainer = style({
  display: 'inline-flex',
  flexWrap: 'wrap',
  gap: '6px',
  padding: '4px 16px 12px',
});

export const pillBase = style({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '2px 8px',
  borderRadius: '9999px',
  fontSize: '11px',
  fontWeight: 600,
  fontFamily: vars.font.sans,
  cursor: 'pointer',
  border: '1px solid',
  transition: 'opacity 100ms ease',
  ':hover': {
    opacity: 0.8,
  },
});

export const deletedPill = style({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '2px 8px',
  borderRadius: '9999px',
  fontSize: '11px',
  fontFamily: vars.font.sans,
  backgroundColor: vars.color.border,
  border: `1px solid ${vars.color.border}`,
  color: vars.color.textLight,
  textDecoration: 'line-through',
  cursor: 'default',
});
