import { globalStyle, style, styleVariants } from '@vanilla-extract/css';

export const iconBase = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

globalStyle(`${iconBase} svg`, { width: '100%', height: '100%' });

export const iconSizes = styleVariants({
  16: { width: '16px', height: '16px' },
  20: { width: '20px', height: '20px' },
  24: { width: '24px', height: '24px' },
}) as Record<16 | 20 | 24, string>;
