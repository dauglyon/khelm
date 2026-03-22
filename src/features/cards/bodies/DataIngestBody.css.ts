import { style } from '@vanilla-extract/css';
import { vars } from '@/theme';

export const ingestContainer = style({
  padding: '0 16px 16px',
});

export const fileInfo = style({
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
  fontSize: '13px',
  color: vars.color.textMid,
  fontFamily: vars.font.sans,
  marginBottom: '12px',
});

export const progressContainer = style({
  width: '100%',
  height: '6px',
  borderRadius: '3px',
  backgroundColor: vars.color.border,
  marginBottom: '12px',
  overflow: 'hidden',
});

export const progressFill = style({
  height: '100%',
  borderRadius: '3px',
  backgroundColor: vars.color.inputType.dataIngest.fg,
  transition: 'width 200ms ease-out',
});

export const sectionDivider = style({
  borderTop: `1px solid ${vars.color.border}`,
  margin: '12px 0',
});

export const schemaTable = style({
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '13px',
  fontFamily: vars.font.sans,
});

export const schemaHeader = style({
  fontWeight: 600,
  fontSize: '13px',
  textAlign: 'left',
  padding: '6px 10px',
  borderBottom: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.surface,
});

export const schemaCell = style({
  padding: '6px 10px',
  fontSize: '13px',
  borderBottom: `1px solid ${vars.color.border}`,
});

export const schemaCellMono = style({
  fontFamily: vars.font.mono,
  fontSize: '12px',
});

export const sampleValues = style({
  color: vars.color.textLight,
});

export const sampleTable = style({
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '13px',
  fontFamily: vars.font.sans,
  marginTop: '12px',
});

export const sampleHeader = style({
  fontWeight: 600,
  fontSize: '13px',
  textAlign: 'left',
  padding: '8px 12px',
  borderBottom: `1px solid ${vars.color.border}`,
  position: 'sticky',
  top: 0,
  backgroundColor: vars.color.surface,
});

export const sampleCell = style({
  padding: '8px 12px',
  fontSize: '13px',
  borderBottom: `1px solid ${vars.color.border}`,
});

export const totalRows = style({
  fontSize: '13px',
  color: vars.color.textMid,
  fontFamily: vars.font.sans,
  marginTop: '8px',
});

export const uploadIdText = style({
  fontSize: '11px',
  color: vars.color.textLight,
  fontFamily: vars.font.mono,
  marginTop: '4px',
});
