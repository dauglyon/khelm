import { style } from '@vanilla-extract/css';
import { vars } from '@/theme';

export const pythonContainer = style({
  padding: '0 16px 16px',
});

export const codeBlock = style({
  padding: '12px',
  borderRadius: '4px',
  backgroundColor: vars.color.bg,
  fontFamily: vars.font.mono,
  fontSize: '14px',
  lineHeight: 1.6,
  overflowX: 'auto',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  color: vars.color.text,
  margin: 0,
});

export const outputSection = style({
  marginTop: '12px',
});

export const sectionLabel = style({
  fontSize: '11px',
  fontWeight: 600,
  fontFamily: vars.font.sans,
  color: vars.color.textMid,
  marginBottom: '4px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
});

export const stdoutPanel = style({
  padding: '12px',
  fontFamily: vars.font.mono,
  fontSize: '13px',
  whiteSpace: 'pre-wrap',
  backgroundColor: vars.color.surface,
  borderRadius: '4px',
  border: `1px solid ${vars.color.border}`,
  color: vars.color.text,
});

export const stderrPanel = style({
  padding: '12px',
  fontFamily: vars.font.mono,
  fontSize: '13px',
  whiteSpace: 'pre-wrap',
  backgroundColor: '#C5303010',
  borderRadius: '4px',
  border: `1px solid ${vars.color.status.error}33`,
  color: vars.color.status.error,
  marginTop: '8px',
});

export const returnValueBlock = style({
  marginTop: '8px',
  fontSize: '13px',
  fontFamily: vars.font.mono,
  color: vars.color.textMid,
});

export const returnLabel = style({
  fontWeight: 600,
  fontFamily: vars.font.sans,
  marginRight: '4px',
});

export const figureContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  marginTop: '12px',
});

export const figureImage = style({
  maxWidth: '100%',
  borderRadius: '4px',
  border: `1px solid ${vars.color.border}`,
});

export const figureCaption = style({
  fontSize: '13px',
  color: vars.color.textMid,
  textAlign: 'center',
  fontFamily: vars.font.sans,
});
