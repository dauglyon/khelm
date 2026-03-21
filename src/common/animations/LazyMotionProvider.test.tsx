import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
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

  it('renders without errors', () => {
    expect(() =>
      render(
        <LazyMotionProvider>
          <span>content</span>
        </LazyMotionProvider>
      )
    ).not.toThrow();
  });
});
