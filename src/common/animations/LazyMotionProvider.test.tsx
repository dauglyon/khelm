import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { m, motion } from 'motion/react';
import { LazyMotionProvider } from './LazyMotionProvider';

describe('LazyMotionProvider', () => {
  it('renders children correctly', () => {
    render(
      <LazyMotionProvider>
        <div data-testid="child" />
      </LazyMotionProvider>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders m components without error and throws for motion components (strict mode)', () => {
    // m.div should render successfully inside LazyMotionProvider
    render(
      <LazyMotionProvider>
        <m.div data-testid="m-child" />
      </LazyMotionProvider>
    );
    expect(screen.getByTestId('m-child')).toBeInTheDocument();

    // The strict prop causes LazyMotion to throw when a full `motion` component
    // is used inside the provider, enforcing tree-shaking via `m` components.
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    expect(() =>
      render(
        <LazyMotionProvider>
          <motion.div />
        </LazyMotionProvider>
      )
    ).toThrow();
    consoleError.mockRestore();
  });
});
