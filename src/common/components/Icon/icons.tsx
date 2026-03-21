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
};

export type IconName = keyof typeof iconPaths;
