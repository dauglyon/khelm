import { style } from '@vanilla-extract/css';
import { vars } from './contract.css';

export const displayLg = style({
  fontSize: '28px',
  fontWeight: 700,
  lineHeight: 1.2,
  fontFamily: vars.font.sans,
});

export const displaySm = style({
  fontSize: '22px',
  fontWeight: 600,
  lineHeight: 1.3,
  fontFamily: vars.font.sans,
});

export const heading = style({
  fontSize: '18px',
  fontWeight: 600,
  lineHeight: 1.4,
  fontFamily: vars.font.sans,
});

export const body = style({
  fontSize: '15px',
  fontWeight: 400,
  lineHeight: 1.5,
  fontFamily: vars.font.sans,
});

export const bodySm = style({
  fontSize: '13px',
  fontWeight: 400,
  lineHeight: 1.5,
  fontFamily: vars.font.sans,
});

export const caption = style({
  fontSize: '11px',
  fontWeight: 500,
  lineHeight: 1.4,
  fontFamily: vars.font.sans,
});

export const mono = style({
  fontSize: '14px',
  fontWeight: 400,
  lineHeight: 1.6,
  fontFamily: vars.font.mono,
});

export const monoSm = style({
  fontSize: '12px',
  fontWeight: 400,
  lineHeight: 1.6,
  fontFamily: vars.font.mono,
});

export const typography = {
  displayLg,
  displaySm,
  heading,
  body,
  bodySm,
  caption,
  mono,
  monoSm,
} as const;
