import { style, composeStyles } from '@vanilla-extract/css';
import { vars } from '@/theme';
import {
  inputWrapper,
  inputWrapperFocused,
  inputWrapperError,
  inputWrapperSizeVariants,
  inputWrapperDisabled,
  inputErrorMessage,
} from '../_shared/inputWrapper.css';

// Extend the shared wrapper with Select-specific positioning
const wrapperPositioned = style({
  position: 'relative',
});

// Re-export shared styles under the original names for backward compatibility
export const wrapper = composeStyles(inputWrapper, wrapperPositioned);
export const wrapperFocused = inputWrapperFocused;
export const wrapperError = inputWrapperError;
export const wrapperSizeVariants = inputWrapperSizeVariants;
export const wrapperDisabled = inputWrapperDisabled;
export const errorMessage = inputErrorMessage;

export const selectElement = style({
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
  cursor: 'pointer',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  appearance: 'none',
});

export const chevronWrapper = style({
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  color: vars.color.textMid,
  paddingRight: '10px',
  pointerEvents: 'none',
});
