import { style } from '@vanilla-extract/css';
import { vars } from '@/theme';

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

export const cardLink = style({
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      // pragma: rgba value intentionally hardcoded for subtle shadow effect
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      borderColor: vars.color.textLight,
    },
  },
});
