import { style } from '@vanilla-extract/css';
import { vars } from '@/theme';

export const panelContainer = style({
  width: 'max(320px, 40%)',
  borderLeft: `1px solid ${vars.color.border}`,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  maxHeight: '500px',
  backgroundColor: vars.color.surface,
});

export const panelHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 12px',
  borderBottom: `1px solid ${vars.color.border}`,
  fontSize: '13px',
  fontWeight: 600,
  fontFamily: vars.font.sans,
  color: vars.color.text,
});

export const messageList = style({
  flex: 1,
  overflowY: 'auto',
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

export const userMessage = style({
  alignSelf: 'flex-end',
  maxWidth: '80%',
  padding: '8px 12px',
  borderRadius: '12px 12px 4px 12px',
  backgroundColor: vars.color.bg,
  fontSize: '13px',
  fontFamily: vars.font.sans,
  lineHeight: 1.5,
  color: vars.color.text,
});

export const assistantMessage = style({
  alignSelf: 'flex-start',
  maxWidth: '80%',
  padding: '8px 12px',
  borderRadius: '12px 12px 12px 4px',
  backgroundColor: vars.color.border,
  fontSize: '13px',
  fontFamily: vars.font.sans,
  lineHeight: 1.5,
  color: vars.color.text,
});

export const errorMessage = style({
  backgroundColor: '#C5303015',
  borderColor: vars.color.status.error,
});

export const pendingMessage = style({
  opacity: 0.7,
});

export const abortedSuffix = style({
  fontSize: '11px',
  color: vars.color.textLight,
  fontStyle: 'italic',
  marginLeft: '4px',
});

export const inputArea = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  borderTop: `1px solid ${vars.color.border}`,
});

export const chatInput = style({
  flex: 1,
  border: `1px solid ${vars.color.border}`,
  borderRadius: '6px',
  padding: '6px 10px',
  fontSize: '13px',
  fontFamily: vars.font.sans,
  color: vars.color.text,
  backgroundColor: vars.color.surface,
  outline: 'none',
  ':focus': {
    borderColor: vars.color.status.running,
  },
  ':disabled': {
    opacity: 0.5,
  },
});

export const actionBar = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '4px 12px 8px',
});
