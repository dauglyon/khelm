import {
  badgeBase,
  dot,
  dotColorVariants,
  dotPulse,
  labelStyle,
} from './Badge.css';

type BadgeStatus = 'thinking' | 'running' | 'complete' | 'error';

export interface BadgeProps {
  /** Status determines dot color */
  status: BadgeStatus;
  /** Optional text label beside dot */
  label?: string;
  /** Whether the dot pulses. Default: true for thinking/running, false otherwise */
  pulse?: boolean;
  /** Additional CSS class */
  className?: string;
}

const defaultPulseStatuses = new Set<BadgeStatus>(['thinking', 'running']);

export function Badge({
  status,
  label,
  pulse,
  className,
}: BadgeProps) {
  const shouldPulse = pulse ?? defaultPulseStatuses.has(status);

  const baseClasses = [badgeBase, className].filter(Boolean).join(' ');
  const dotClasses = [dot, dotColorVariants[status], shouldPulse ? dotPulse : undefined]
    .filter(Boolean)
    .join(' ');

  const ariaLabelText = label
    ? `Status: ${status} - ${label}`
    : `Status: ${status}`;

  return (
    <span
      className={baseClasses}
      aria-live="polite"
      aria-label={ariaLabelText}
    >
      <span className={dotClasses} data-testid="badge-dot" />
      {label && <span className={labelStyle}>{label}</span>}
    </span>
  );
}
