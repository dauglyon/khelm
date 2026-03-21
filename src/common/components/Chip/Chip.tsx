import type { InputType } from '@/theme';
import { Icon } from '@/common/components/Icon';
import {
  chipBase,
  chipSizeVariants,
  chipColorVariants,
  closeButton,
} from './Chip.css';

export interface ChipProps {
  /** Input type determines chip color */
  inputType: InputType;
  /** Display text */
  label: string;
  /** Optional remove handler. Shows close button when provided. */
  onRemove?: () => void;
  /** Chip size. Default: 'md' */
  size?: 'sm' | 'md';
  /** Additional CSS class */
  className?: string;
}

export function Chip({
  inputType,
  label,
  onRemove,
  size = 'md',
  className,
}: ChipProps) {
  const classes = [
    chipBase,
    chipSizeVariants[size],
    chipColorVariants[inputType],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes}>
      {label}
      {onRemove && (
        <button
          type="button"
          className={closeButton}
          onClick={onRemove}
          aria-label={`Remove ${label}`}
        >
          <Icon name="close" size={16} />
        </button>
      )}
    </span>
  );
}
