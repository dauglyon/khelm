import { style } from '@vanilla-extract/css';
import { vars } from '@/theme';

export const backdrop = style({
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
});

export const detailPanel = style({
  width: 'min(720px, 90vw)',
  maxHeight: '90vh',
  overflowY: 'auto',
  backgroundColor: vars.color.surface,
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
  position: 'relative',
  zIndex: 101,
});
