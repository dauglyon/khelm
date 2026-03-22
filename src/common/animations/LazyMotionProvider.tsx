import { type ReactNode } from 'react';
import { LazyMotion, domAnimation } from 'motion/react';

/**
 * Async loader for domMax features (~25 KB).
 * Loads drag, layout FLIP, and other advanced features on first use.
 * Exported so that consumers can trigger the async load explicitly when
 * they need advanced features (e.g., drag or layout FLIP animations).
 */
export const loadDomMax = () =>
  import('motion/react').then((mod) => mod.domMax);

interface LazyMotionProviderProps {
  children: ReactNode;
}

/**
 * App-level wrapper that provides code-split Motion features.
 *
 * Loads `domAnimation` synchronously (~4.6 KB, covers opacity/transform).
 * Use the exported `loadDomMax` utility to async-load `domMax` (~25 KB,
 * adds drag and layout FLIP) on first use elsewhere in the app.
 *
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
