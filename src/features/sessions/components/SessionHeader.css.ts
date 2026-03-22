import { style } from '@vanilla-extract/css';
import { vars } from '@/theme';

export const headerContent = style({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  flex: 1,
});

export const titleDisplay = style({
  fontSize: '16px',
  fontWeight: 500,
  color: vars.color.text,
  cursor: 'pointer',
  padding: '4px 8px',
  borderRadius: '4px',
  border: '1px solid transparent',
  background: 'none',
  fontFamily: vars.font.sans,
  ':hover': {
    borderColor: vars.color.border,
  },
});

export const savingIndicator = style({
  fontSize: '12px',
  color: vars.color.textLight,
  fontStyle: 'italic',
});

export const actionsMenu = style({
  display: 'flex',
  gap: '4px',
  alignItems: 'center',
});

export const confirmOverlay = style({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
});

export const confirmDialog = style({
  backgroundColor: vars.color.surface,
  padding: '24px',
  borderRadius: '8px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
  maxWidth: '400px',
  width: '90%',
  fontFamily: vars.font.sans,
});

export const confirmTitle = style({
  fontSize: '16px',
  fontWeight: 600,
  color: vars.color.text,
  marginBottom: '12px',
});

export const confirmText = style({
  fontSize: '14px',
  color: vars.color.textMid,
  marginBottom: '20px',
});

export const confirmButtons = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '8px',
});
