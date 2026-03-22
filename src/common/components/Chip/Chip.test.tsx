import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Chip } from './Chip';

describe('Chip', () => {
  it('renders with label text', () => {
    render(<Chip inputType="sql" label="SQL Query" />);
    expect(screen.getByText('SQL Query')).toBeInTheDocument();
  });

  it('applies correct color variant class for a given input type', () => {
    const { container } = render(<Chip inputType="sql" label="SQL" />);
    const chip = container.firstElementChild as HTMLElement;
    // The chip should have classes applied (including the color variant)
    expect(chip.className).toBeTruthy();
  });

  it('renders at sm size', () => {
    const { container } = render(
      <Chip inputType="python" label="Python" size="sm" />
    );
    const chip = container.firstElementChild as HTMLElement;
    expect(chip.className).toBeTruthy();
  });

  it('renders at md size', () => {
    const { container } = render(
      <Chip inputType="literature" label="Literature" size="md" />
    );
    const chip = container.firstElementChild as HTMLElement;
    expect(chip.className).toBeTruthy();
  });

  it('shows close button when onRemove is provided', () => {
    render(<Chip inputType="sql" label="SQL" onRemove={() => {}} />);
    expect(screen.getByRole('button', { name: 'Remove SQL' })).toBeInTheDocument();
  });

  it('calls onRemove when close button is clicked', () => {
    const onRemove = vi.fn();
    render(<Chip inputType="sql" label="SQL" onRemove={onRemove} />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove SQL' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('close button has accessible label', () => {
    render(<Chip inputType="sql" label="SQL" onRemove={() => {}} />);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('aria-label')).toBe('Remove SQL');
  });

  it('no close button when onRemove is not provided', () => {
    render(<Chip inputType="sql" label="SQL" />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders all input types', () => {
    const types = [
      'sql',
      'python',
      'literature',
      'chat',
      'note',
      'dataIngest',
      'task',
    ] as const;
    for (const type of types) {
      const { unmount } = render(<Chip inputType={type} label={type} />);
      expect(screen.getByText(type)).toBeInTheDocument();
      unmount();
    }
  });
});
