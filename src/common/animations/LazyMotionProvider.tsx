import { type ReactNode } from 'react';
import { LazyMotion, domAnimation } from 'motion/react';

/**
 * Async loader for domMax features (~25 KB).
 * Loads drag, layout FLIP, and other advanced features on first use.
 */
const loadDomMax = () => import('motion/react').then((mod) => mod.domMax);

// Ensure loadDomMax is available for future use (e.g., when a component needs
// advanced features like drag or layout animations).
void loadDomMax;

interface LazyMotionProviderProps {
  children: ReactNode;
}

/**
 * App-level wrapper that provides code-split Motion features.
 *
 * Loads `domAnimation` synchronously (~4.6 KB, covers opacity/transform).
 * The `strict` prop ensures components use `m` instead of `motion` for
 * proper tree-shaking — any use of the full `motion` component inside
 * this provider will throw a runtime error in development.
 */
export function LazyMotionProvider({ children }: LazyMotionProviderProps) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
