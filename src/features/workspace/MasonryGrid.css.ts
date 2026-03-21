import { style } from '@vanilla-extract/css';

export const scrollContainer = style({
  width: '100%',
  height: '100%',
  overflowY: 'auto',
  position: 'relative',
});

export const gridInner = style({
  position: 'relative',
  width: '100%',
});
