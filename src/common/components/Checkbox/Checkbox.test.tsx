import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('renders unchecked by default', () => {
    render(<Checkbox />);
    const input = screen.getByRole('checkbox');
    expect(input).not.toBeChecked();
  });

  it('renders with label text', () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByText('Accept terms')).toBeInTheDocument();
  });

  it('checked state shows check indicator', () => {
    const { container } = render(<Checkbox checked />);
    const input = screen.getByRole('checkbox');
    expect(input).toBeChecked();
    // Check icon SVG should be present
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
  });

  it('indeterminate state shows minus indicator', () => {
    const { container } = render(<Checkbox indeterminate />);
    const input = screen.getByRole('checkbox') as HTMLInputElement;
    expect(input.indeterminate).toBe(true);
    // Minus icon SVG should be present
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
  });

  it('calls onChange with new checked value on click', () => {
    const onChange = vi.fn();
    render(<Checkbox onChange={onChange} />);
    const input = screen.getByRole('checkbox');
    fireEvent.click(input);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('disabled prevents interaction', () => {
    const onChange = vi.fn();
    render(<Checkbox disabled onChange={onChange} />);
    const input = screen.getByRole('checkbox');
    expect(input).toBeDisabled();
    fireEvent.click(input);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('forwards ref to the input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('INPUT');
    expect(ref.current?.type).toBe('checkbox');
  });

  it('label click toggles checkbox', () => {
    const onChange = vi.fn();
    render(<Checkbox label="Toggle me" onChange={onChange} />);
    // Click the label element (parent of the text span), which toggles the associated input
    const labelEl = screen.getByText('Toggle me').closest('label')!;
    fireEvent.click(labelEl);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
