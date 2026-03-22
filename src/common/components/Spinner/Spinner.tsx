import { vars } from '@/theme';
import { spinnerBase, spinnerSizes } from './Spinner.css';

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
  const classes = [spinnerBase, spinnerSizes[size], className]
    .filter(Boolean)
    .join(' ');

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label="Loading"
      className={classes}
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
