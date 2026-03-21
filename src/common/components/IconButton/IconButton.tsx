import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Spinner } from '@/common/components/Spinner';
import {
  buttonBase,
  sizeVariants,
  colorVariantStyles,
  disabledStyle,
} from '@/common/components/Button/Button.css';
import { squareSizeVariants } from './IconButton.css';

type ButtonVariant = 'solid' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonColor = 'primary' | 'danger' | 'neutral';

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color' | 'children'> {
  /** Icon element to render */
  icon: ReactNode;
  /** Accessible label (required for icon-only buttons) */
  'aria-label': string;
  /** Visual variant. Default: 'solid' */
  variant?: ButtonVariant;
  /** Button size. Default: 'md' */
  size?: ButtonSize;
  /** Color scheme. Default: 'primary' */
  color?: ButtonColor;
  /** Loading state: replaces icon with Spinner. Default: false */
  loading?: boolean;
}

const spinnerSizeMap: Record<ButtonSize, 16 | 20 | 24> = {
  sm: 16,
  md: 20,
  lg: 24,
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      icon,
      variant = 'solid',
      size = 'md',
      color = 'primary',
      loading = false,
      disabled = false,
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
      squareSizeVariants[size],
      colorVariantStyles[colorVariantKey],
      (disabled || loading) ? disabledStyle : undefined,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled || loading}
        aria-busy={loading ? true : undefined}
        {...rest}
      >
        {loading ? <Spinner size={spinnerSizeMap[size]} /> : icon}
      </button>
    );
  }
);
