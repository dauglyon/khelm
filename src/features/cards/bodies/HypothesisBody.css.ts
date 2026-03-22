import { style } from '@vanilla-extract/css';
import { vars } from '@/theme';

export const hypContainer = style({
  padding: '0 16px 16px',
});

export const claimCallout = style({
  borderLeft: `3px solid ${vars.color.inputType.hypothesis.fg}`,
  padding: '16px 20px',
  backgroundColor: vars.color.inputType.hypothesis.bg,
  borderRadius: '0 4px 4px 0',
  marginBottom: '12px',
});

export const claimText = style({
  fontFamily: vars.font.serif,
  fontSize: '18px',
  lineHeight: 1.5,
  fontStyle: 'italic',
  color: vars.color.text,
  margin: 0,
});

export const evidenceText = style({
  fontSize: '13px',
  fontFamily: vars.font.sans,
  color: vars.color.textMid,
  marginTop: '8px',
  lineHeight: 1.5,
});

export const domainTag = style({
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: '9999px',
  backgroundColor: vars.color.bg,
  border: `1px solid ${vars.color.border}`,
  fontSize: '11px',
  fontFamily: vars.font.sans,
  color: vars.color.textMid,
  marginTop: '8px',
});

export const analysisSection = style({
  marginTop: '12px',
  fontSize: '15px',
  fontFamily: vars.font.sans,
  lineHeight: 1.6,
  color: vars.color.text,
});

export const confidenceLabel = style({
  fontSize: '13px',
  fontFamily: vars.font.sans,
  marginTop: '12px',
  fontWeight: 600,
});

export const chipsContainer = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  marginTop: '12px',
});
