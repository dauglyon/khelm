import { style } from '@vanilla-extract/css';
import { vars } from '@/theme';

export const stopButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 12px',
  backgroundColor: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: '6px',
  fontFamily: vars.font.sans,
  fontSize: '13px',
  fontWeight: 500,
  color: vars.color.text,
  cursor: 'pointer',
  transition: 'background-color 0.15s ease, opacity 0.15s ease',
  ':hover': {
    backgroundColor: vars.color.bg,
  },
  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

export const stopIcon = style({
  width: '12px',
  height: '12px',
  backgroundColor: vars.color.status.error,
  borderRadius: '2px',
});
