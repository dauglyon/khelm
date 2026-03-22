import { style } from '@vanilla-extract/css';
import { vars } from '@/theme';
import {
  inputWrapper,
  inputWrapperFocused,
  inputWrapperError,
  inputWrapperSizeVariants,
  inputWrapperDisabled,
  inputErrorMessage,
} from '../_shared/inputWrapper.css';

// Re-export shared styles under the original names for backward compatibility
export const wrapper = inputWrapper;
export const wrapperFocused = inputWrapperFocused;
export const wrapperError = inputWrapperError;
export const wrapperSizeVariants = inputWrapperSizeVariants;
export const wrapperDisabled = inputWrapperDisabled;
export const errorMessage = inputErrorMessage;

export const inputElement = style({
  border: 'none',
  outline: 'none',
  background: 'transparent',
  flex: 1,
  minWidth: 0,
  fontSize: 'inherit',
  fontFamily: 'inherit',
  lineHeight: 'inherit',
  color: vars.color.text,
  padding: '0 10px',
  height: '100%',
  '::placeholder': {
    color: vars.color.textLight,
  },
});

export const adornment = style({
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  color: vars.color.textMid,
});

export const prefixStyle = style({
  paddingLeft: '10px',
});

export const suffixStyle = style({
  paddingRight: '10px',
});
