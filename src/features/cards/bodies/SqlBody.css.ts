import { style } from '@vanilla-extract/css';
import { vars } from '@/theme';

export const sqlContainer = style({
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

export const dataSourceLabel = style({
  fontSize: '11px',
  fontFamily: vars.font.sans,
  color: vars.color.textLight,
  marginTop: '4px',
  marginBottom: '12px',
});

export const tableContainer = style({
  maxHeight: '400px',
  overflowY: 'auto',
  overflowX: 'auto',
  border: `1px solid ${vars.color.border}`,
  borderRadius: '4px',
});

export const resultTable = style({
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '13px',
  fontFamily: vars.font.sans,
});

export const tableHeader = style({
  fontWeight: 600,
  fontSize: '13px',
  textAlign: 'left',
  padding: '8px 12px',
  borderBottom: `1px solid ${vars.color.border}`,
  position: 'sticky',
  top: 0,
  backgroundColor: vars.color.surface,
  zIndex: 1,
});

export const tableCell = style({
  padding: '8px 12px',
  fontSize: '13px',
  borderBottom: `1px solid ${vars.color.border}`,
  maxWidth: '200px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const tableRowEven = style({
  backgroundColor: vars.color.bg,
});

export const rowCount = style({
  fontSize: '13px',
  fontFamily: vars.font.sans,
  color: vars.color.textMid,
  marginTop: '8px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});
