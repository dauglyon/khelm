import { style } from '@vanilla-extract/css';
import { vars } from '@/theme';

export const litContainer = style({
  padding: '0 16px 16px',
});

export const searchTerms = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px',
  marginBottom: '12px',
});

export const searchTermTag = style({
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: '9999px',
  backgroundColor: vars.color.bg,
  border: `1px solid ${vars.color.border}`,
  fontSize: '11px',
  fontFamily: vars.font.sans,
  color: vars.color.textMid,
});

export const publicationList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

export const publicationItem = style({
  padding: '12px',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'background-color 100ms ease',
  ':hover': {
    backgroundColor: vars.color.bg,
  },
});

export const pubTitle = style({
  fontWeight: 600,
  fontSize: '15px',
  color: vars.color.text,
  fontFamily: vars.font.sans,
  lineHeight: 1.5,
});

export const pubAuthors = style({
  fontSize: '13px',
  color: vars.color.textMid,
  fontFamily: vars.font.sans,
  lineHeight: 1.5,
});

export const pubSource = style({
  fontSize: '13px',
  color: vars.color.textLight,
  fontStyle: 'italic',
  fontFamily: vars.font.sans,
});

export const pubAbstract = style({
  fontSize: '13px',
  color: vars.color.text,
  marginTop: '8px',
  lineHeight: 1.6,
  fontFamily: vars.font.sans,
});

export const resultCount = style({
  fontSize: '11px',
  color: vars.color.textLight,
  padding: '8px 0',
  fontFamily: vars.font.sans,
});
