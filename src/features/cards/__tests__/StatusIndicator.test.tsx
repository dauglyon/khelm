import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusIndicator } from '../StatusIndicator';

describe('StatusIndicator', () => {
  it('renders thinking status dot', () => {
    render(<StatusIndicator status="thinking" />);
    expect(screen.getByTestId('status-thinking')).toBeInTheDocument();
  });

  it('renders running status spinner', () => {
    render(<StatusIndicator status="running" />);
    expect(screen.getByTestId('status-running')).toBeInTheDocument();
  });

  it('renders complete status checkmark', () => {
    render(<StatusIndicator status="complete" />);
    expect(screen.getByTestId('status-complete')).toBeInTheDocument();
  });

  it('renders error status icon', () => {
    render(<StatusIndicator status="error" />);
    expect(screen.getByTestId('status-error')).toBeInTheDocument();
  });

  it('has aria-label with status name', () => {
    render(<StatusIndicator status="complete" />);
    expect(screen.getByLabelText('Status: complete')).toBeInTheDocument();
  });

  it('has role=status', () => {
    render(<StatusIndicator status="thinking" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('supports sm size', () => {
    render(<StatusIndicator status="thinking" size="sm" />);
    expect(screen.getByTestId('status-thinking')).toBeInTheDocument();
  });
});
