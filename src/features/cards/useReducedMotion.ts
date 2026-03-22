import { useMediaQuery } from '@/common/hooks';

/**
 * Returns true if the user prefers reduced motion.
 */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
