import { vars } from '@/theme';
import { spin } from '@/common/animations/keyframes.css';

export interface SpinnerProps {
  /** Spinner size in pixels. Default: 20 */
  size?: 16 | 20 | 24;
  /** Spinner color token. Default: vars.color.textMid */
  color?: string;
  /** Additional CSS class */
  className?: string;
}

export function Spinner({
  size = 20,
  color = vars.color.textMid,
  className,
}: SpinnerProps) {
  const mergedClassName = className ? `${spin} ${className}` : spin;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label="Loading"
      className={mergedClassName}
    >
      <circle
        cx={12}
        cy={12}
        r={10}
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray="47 16"
      />
    </svg>
  );
}
