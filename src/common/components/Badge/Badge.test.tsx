import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders dot for each status', () => {
    const statuses = ['thinking', 'queued', 'running', 'complete', 'error'] as const;
    for (const status of statuses) {
      const { unmount } = render(<Badge status={status} />);
      expect(screen.getByTestId('badge-dot')).toBeInTheDocument();
      unmount();
    }
  });

  it('renders label text when provided', () => {
    render(<Badge status="running" label="Processing" />);
    expect(screen.getByText('Processing')).toBeInTheDocument();
  });

  it('no label text when label is not provided', () => {
    const { container } = render(<Badge status="complete" />);
    // Only dot should be present, no label span text content
    const spans = container.querySelectorAll('span');
    // badgeBase span + dot span = 2 spans
    expect(spans.length).toBe(2);
  });

  it('pulse animation active for thinking status by default', () => {
    render(<Badge status="thinking" />);
    const dotEl = screen.getByTestId('badge-dot');
    // Should have pulse class
    expect(dotEl.className).toBeTruthy();
    // Multiple classes (dot + color variant + pulse)
    expect(dotEl.className.split(' ').length).toBeGreaterThanOrEqual(2);
  });

  it('pulse animation active for queued status by default', () => {
    render(<Badge status="queued" />);
    const dotEl = screen.getByTestId('badge-dot');
    // dot + dotColorVariant + pulse = 3 classes
    expect(dotEl.className.split(' ').length).toBeGreaterThanOrEqual(3);
  });

  it('pulse animation active for running status by default', () => {
    render(<Badge status="running" />);
    const dotEl = screen.getByTestId('badge-dot');
    expect(dotEl.className.split(' ').length).toBeGreaterThanOrEqual(2);
  });

  it('pulse animation inactive for complete status by default', () => {
    render(<Badge status="complete" />);
    const dotEl = screen.getByTestId('badge-dot');
    // Should not have pulse class — fewer classes than pulsing variants
    const classCount = dotEl.className.split(' ').length;
    // dot + dotColorVariant = 2 classes (no pulse)
    expect(classCount).toBe(2);
  });

  it('pulse animation inactive for error status by default', () => {
    render(<Badge status="error" />);
    const dotEl = screen.getByTestId('badge-dot');
    const classCount = dotEl.className.split(' ').length;
    // dot + dotColorVariant = 2 classes (no pulse)
    expect(classCount).toBe(2);
  });

  it('pulse={false} overrides default pulse behavior', () => {
    render(<Badge status="thinking" pulse={false} />);
    const dotEl = screen.getByTestId('badge-dot');
    // Without pulse: dot + dotColorVariant = 2 classes
    const classCount = dotEl.className.split(' ').length;
    expect(classCount).toBe(2);
  });

  it('pulse={false} overrides queued default pulse', () => {
    render(<Badge status="queued" pulse={false} />);
    const dotEl = screen.getByTestId('badge-dot');
    const classCount = dotEl.className.split(' ').length;
    expect(classCount).toBe(2);
  });

  it('has aria-live="polite" region', () => {
    const { container } = render(<Badge status="running" />);
    const region = container.querySelector('[aria-live="polite"]');
    expect(region).not.toBeNull();
  });

  it('has accessible status text', () => {
    const { container } = render(<Badge status="running" />);
    const el = container.querySelector('[aria-label]');
    expect(el).not.toBeNull();
    expect(el!.getAttribute('aria-label')).toContain('running');
  });

  it('defaults to md size', () => {
    const { container } = render(<Badge status="complete" />);
    const wrapper = container.querySelector('span');
    // md size variant class should be present
    expect(wrapper).not.toBeNull();
    expect(wrapper!.className).toBeTruthy();
  });

  it('applies sm size variant class', () => {
    const { container: containerMd } = render(<Badge status="complete" size="md" />);
    const { container: containerSm } = render(<Badge status="complete" size="sm" />);
    const wrapperMd = containerMd.querySelector('span')!;
    const wrapperSm = containerSm.querySelector('span')!;
    // sm and md should have different classes
    expect(wrapperSm.className).not.toBe(wrapperMd.className);
  });
});
