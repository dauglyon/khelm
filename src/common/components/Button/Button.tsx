import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Spinner } from '@/common/components/Spinner';
import {
  buttonBase,
  sizeVariants,
  colorVariantStyles,
  disabledStyle,
  iconSlot,
} from './Button.css';

type ButtonVariant = 'solid' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonColor = 'primary' | 'danger' | 'neutral';

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  /** Visual variant. Default: 'solid' */
  variant?: ButtonVariant;
  /** Button size. Default: 'md' */
  size?: ButtonSize;
  /** Color scheme. Default: 'primary' */
  color?: ButtonColor;
  /** Leading icon slot */
  icon?: ReactNode;
  /** Loading state: replaces icon with Spinner. Default: false */
  loading?: boolean;
  /** Button label */
  children?: ReactNode;
}

const spinnerSizeMap: Record<ButtonSize, 16 | 20 | 24> = {
  sm: 16,
  md: 20,
  lg: 24,
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'solid',
      size = 'md',
      color = 'primary',
      icon,
      loading = false,
      disabled = false,
      children,
      className,
      type = 'button',
      ...rest
    },
    ref
  ) {
    const colorVariantKey =
      `${variant}-${color}` as keyof typeof colorVariantStyles;

    const classes = [
      buttonBase,
      sizeVariants[size],
      colorVariantStyles[colorVariantKey],
      (disabled || loading) ? disabledStyle : undefined,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const renderIcon = () => {
      if (loading) {
        return (
          <span className={iconSlot}>
            <Spinner size={spinnerSizeMap[size]} />
          </span>
        );
      }
      if (icon) {
        return <span className={iconSlot}>{icon}</span>;
      }
      return null;
    };

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled || loading}
        aria-busy={loading ? true : undefined}
        {...rest}
      >
        {renderIcon()}
        {children}
      </button>
    );
  }
);
