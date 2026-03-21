import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import {
  wrapper,
  wrapperFocused,
  wrapperError,
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
      ...rest
    },
    ref
  ) {
    const hasError = !!error;
    const errorText = typeof error === 'string' ? error : undefined;

    const wrapperClasses = [
      wrapper,
      wrapperFocused,
      wrapperSizeVariants[size],
      hasError ? wrapperError : undefined,
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
            id={id}
            className={inputElement}
            aria-invalid={hasError || undefined}
            {...rest}
          />
          {suffix && (
            <span className={`${adornment} ${suffixStyle}`}>{suffix}</span>
          )}
        </div>
        {errorText && <div className={errorMessage}>{errorText}</div>}
      </div>
    );
  }
);
