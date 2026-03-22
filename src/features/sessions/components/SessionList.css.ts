import { style } from '@vanilla-extract/css';
import { vars } from '@/theme';

export const listContainer = style({
  padding: '32px 24px',
  fontFamily: vars.font.sans,
});

export const listHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
});

export const listTitle = style({
  fontSize: '24px',
  fontWeight: 600,
  color: vars.color.text,
});

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '16px',
});

export const emptyState = style({
  textAlign: 'center',
  padding: '64px 24px',
  color: vars.color.textLight,
  fontSize: '16px',
});

export const emptyTitle = style({
  fontSize: '20px',
  fontWeight: 600,
  color: vars.color.textMid,
  marginBottom: '12px',
});

export const skeletonGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '16px',
});

export const createButtonWrapper = style({
  marginTop: '16px',
});
