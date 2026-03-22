import { forwardRef, useId, type SelectHTMLAttributes, type ReactNode } from 'react';
import { Icon } from '@/common/components/Icon';
import {
  wrapper,
  wrapperFocused,
  wrapperError,
  wrapperDisabled,
  wrapperSizeVariants,
  selectElement,
  chevronWrapper,
  errorMessage,
} from './Select.css';

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Select size. Default: 'md' */
  size?: 'sm' | 'md';
  /** Error state: boolean toggles border, string shows message */
  error?: boolean | string;
  /** Option elements */
  children: ReactNode;
  /** Placeholder option text */
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      size = 'md',
      error = false,
      children,
      className,
      placeholder,
      disabled,
      ...rest
    },
    ref
  ) {
    const hasError = !!error;
    const errorText = typeof error === 'string' ? error : undefined;
    const errorId = useId();

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
          <select
            ref={ref}
            className={selectElement}
            aria-invalid={hasError || undefined}
            aria-describedby={errorText ? errorId : undefined}
            disabled={disabled}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>
          <span className={chevronWrapper} aria-hidden="true">
            <Icon name="chevron-down" size={16} />
          </span>
        </div>
        {errorText && <div id={errorId} className={errorMessage}>{errorText}</div>}
      </div>
    );
  }
);
