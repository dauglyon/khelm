import { style } from '@vanilla-extract/css';
import { vars } from '@/theme';

export const dropdownContainer = style({
  position: 'absolute',
  zIndex: 1000,
  background: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  maxHeight: '280px',
  overflowY: 'auto',
  minWidth: '220px',
  padding: '4px',
  fontFamily: vars.font.sans,
});

export const dropdownItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  cursor: 'pointer',
  borderRadius: '6px',
  fontSize: '14px',
  lineHeight: '20px',
  color: vars.color.text,
  transition: 'background 100ms ease',
  selectors: {
    '&:hover': {
      background: vars.color.bg,
    },
  },
});

export const dropdownItemActive = style({
  background: vars.color.bg,
});

export const itemShortname = style({
  fontWeight: 600,
  fontSize: '13px',
});

export const itemTitle = style({
  color: vars.color.textMid,
  fontSize: '13px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flex: 1,
});

export const typeIndicator = style({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  flexShrink: 0,
});

export const emptyState = style({
  padding: '12px 16px',
  color: vars.color.textLight,
  fontSize: '13px',
  textAlign: 'center',
});
