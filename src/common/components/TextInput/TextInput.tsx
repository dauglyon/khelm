import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import {
  wrapper,
  wrapperFocused,
  wrapperError,
  wrapperDisabled,
  wrapperSizeVariants,
  inputElement,
  adornment,
  prefixStyle,
  suffixStyle,
  errorMessage,
} from './TextInput.css';

export interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  /** Input size. Default: 'md' */
  size?: 'sm' | 'md';
  /** Error state: boolean toggles border, string shows message */
  error?: boolean | string;
  /** Left adornment */
  prefix?: ReactNode;
  /** Right adornment */
  suffix?: ReactNode;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(
    {
      size = 'md',
      error = false,
      prefix,
      suffix,
      className,
      id,
      disabled,
      ...rest
    },
    ref
  ) {
    const autoId = useId();
    const inputId = id ?? autoId;
    const hasError = !!error;
    const errorText = typeof error === 'string' ? error : undefined;
    const errorId = errorText ? `${inputId}-error` : undefined;

    const wrapperClasses = [
      wrapper,
      wrapperFocused,
      wrapperSizeVariants[size],
      hasError ? wrapperError : undefined,
      disabled ? wrapperDisabled : undefined,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div>
        <div className={wrapperClasses}>
          {prefix && (
            <span className={`${adornment} ${prefixStyle}`}>{prefix}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={inputElement}
            aria-invalid={hasError || undefined}
            aria-describedby={errorId}
            disabled={disabled}
            {...rest}
          />
          {suffix && (
            <span className={`${adornment} ${suffixStyle}`}>{suffix}</span>
          )}
        </div>
        {errorText && (
          <div id={errorId} className={errorMessage}>
            {errorText}
          </div>
        )}
      </div>
    );
  }
);
