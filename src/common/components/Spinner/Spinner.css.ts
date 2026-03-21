import { style } from '@vanilla-extract/css';
import { spin } from '@/common/animations/keyframes.css';

export const spinnerBase = style({
  display: 'inline-block',
  animationName: spin,
});
