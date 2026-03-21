import { forwardRef, useEffect, useRef, useId, type ChangeEvent } from 'react';
import {
  checkboxLabel,
  hiddenInput,
  indicator,
  indicatorChecked,
  disabledStyle,
  labelText,
  focusRing,
} from './Checkbox.css';

export interface CheckboxProps {
  /** Checked state. Default: false */
  checked?: boolean;
  /** Indeterminate state. Default: false */
  indeterminate?: boolean;
  /** Label text */
  label?: string;
  /** Disabled state. Default: false */
  disabled?: boolean;
  /** Change handler */
  onChange?: (checked: boolean) => void;
  /** Additional CSS class */
  className?: string;
  /** Input id (auto-generated if not provided) */
  id?: string;
}

const CheckIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M20 6L9 17l-5-5"
      stroke="white"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MinusIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M5 12h14"
      stroke="white"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      checked = false,
      indeterminate = false,
      label,
      disabled = false,
      onChange,
      className,
      id: providedId,
    },
    forwardedRef
  ) {
    const autoId = useId();
    const id = providedId ?? autoId;
    const internalRef = useRef<HTMLInputElement>(null);

    // Merge refs
    const setRef = (el: HTMLInputElement | null) => {
      (internalRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
      if (typeof forwardedRef === 'function') {
        forwardedRef(el);
      } else if (forwardedRef) {
        (forwardedRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
      }
    };

    useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked);
    };

    const isActive = checked || indeterminate;

    const labelClasses = [
      checkboxLabel,
      disabled ? disabledStyle : undefined,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const indicatorClasses = [
      indicator,
      isActive ? indicatorChecked : undefined,
      focusRing,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <label className={labelClasses} htmlFor={id}>
        <input
          ref={setRef}
          type="checkbox"
          id={id}
          className={hiddenInput}
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
        />
        <span className={indicatorClasses}>
          {checked && !indeterminate && <CheckIcon />}
          {indeterminate && <MinusIcon />}
        </span>
        {label && <span className={labelText}>{label}</span>}
      </label>
    );
  }
);
