import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PythonBody } from '../bodies/PythonBody';
import type { PythonContent, PythonResult } from '../types';

const mockContent: PythonContent = {
  code: 'import pandas as pd\ndf.describe()',
  language: 'python',
};

const mockResult: PythonResult = {
  stdout: 'Summary statistics:\n  count: 100',
  stderr: '',
  returnValue: null,
  figures: [],
};

describe('PythonBody', () => {
  it('renders code in code block', () => {
    render(<PythonBody content={mockContent} result={mockResult} status="complete" />);
    expect(screen.getByText(/import pandas/)).toBeInTheDocument();
  });

  it('renders stdout in output panel', () => {
    render(<PythonBody content={mockContent} result={mockResult} status="complete" />);
    expect(screen.getByText('Output')).toBeInTheDocument();
    expect(screen.getByText(/Summary statistics/)).toBeInTheDocument();
  });

  it('does not render stderr section when empty', () => {
    render(<PythonBody content={mockContent} result={mockResult} status="complete" />);
    expect(screen.queryByText('Errors')).not.toBeInTheDocument();
  });

  it('renders stderr when non-empty', () => {
    const resultWithError = { ...mockResult, stderr: 'Traceback: error' };
    render(<PythonBody content={mockContent} result={resultWithError} status="complete" />);
    expect(screen.getByText('Errors')).toBeInTheDocument();
    expect(screen.getByText(/Traceback/)).toBeInTheDocument();
  });

  it('renders return value when non-null', () => {
    const resultWithReturn = { ...mockResult, returnValue: { count: 42 } };
    render(<PythonBody content={mockContent} result={resultWithReturn} status="complete" />);
    expect(screen.getByText('Return:')).toBeInTheDocument();
    expect(screen.getByText(/42/)).toBeInTheDocument();
  });

  it('renders figures as images', () => {
    const resultWithFigures = {
      ...mockResult,
      figures: [
        { src: 'data:image/png;base64,abc', alt: 'test figure', caption: 'Figure 1' },
        { src: 'data:image/png;base64,def', alt: 'test figure 2' },
      ],
    };
    render(<PythonBody content={mockContent} result={resultWithFigures} status="complete" />);
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('alt', 'test figure');
    expect(screen.getByText('Figure 1')).toBeInTheDocument();
  });

  it('shows skeleton when result is null during running', () => {
    const { container } = render(
      <PythonBody content={mockContent} result={null} status="running" />
    );
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });
});
