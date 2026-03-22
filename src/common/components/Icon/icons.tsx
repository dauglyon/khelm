import type { ReactElement } from 'react';

/**
 * SVG path registry for icons.
 * Each entry returns the inner SVG content (path elements) for a 24x24 viewBox.
 */
export const iconPaths: Record<string, ReactElement> = {
  close: (
    <path
      d="M18 6L6 18M6 6l12 12"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  'chevron-down': (
    <path
      d="M6 9l6 6 6-6"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  check: (
    <path
      d="M20 6L9 17l-5-5"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  minus: (
    <path
      d="M5 12h14"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  search: (
    <>
      <circle
        cx={11}
        cy={11}
        r={8}
        stroke="currentColor"
        strokeWidth={2}
        fill="none"
      />
      <path
        d="M21 21l-4.35-4.35"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  ),
  chat: (
    <path
      d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  copy: (
    <>
      <rect
        x={9}
        y={9}
        width={13}
        height={13}
        rx={2}
        ry={2}
        stroke="currentColor"
        strokeWidth={2}
        fill="none"
      />
      <path
        d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  ),
  pin: (
    <path
      d="M12 17v5M9 11l-6 1 4 4-1 6 6-4 6 4-1-6 4-4-6-1-3-5-3 5z"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  'pin-off': (
    <path
      d="M12 17v5M9 11l-6 1 4 4-1 6 6-4 6 4-1-6 4-4-6-1-3-5-3 5z"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="currentColor"
    />
  ),
  trash: (
    <path
      d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  send: (
    <path
      d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  stop: (
    <rect
      x={6}
      y={6}
      width={12}
      height={12}
      rx={1}
      stroke="currentColor"
      strokeWidth={2}
      fill="none"
    />
  ),
  retry: (
    <path
      d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  'alert-circle': (
    <>
      <circle
        cx={12}
        cy={12}
        r={10}
        stroke="currentColor"
        strokeWidth={2}
        fill="none"
      />
      <path
        d="M12 8v4M12 16h.01"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  ),
};

export type IconName = keyof typeof iconPaths;
