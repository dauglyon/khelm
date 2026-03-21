export const easingCSS = {
  out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  outQuart: 'cubic-bezier(0.25, 1, 0.5, 1)',
} as const;

export const easingMotion = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.4, 0, 0.2, 1] as const,
  outQuart: [0.25, 1, 0.5, 1] as const,
} as const;
