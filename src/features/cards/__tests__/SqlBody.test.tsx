import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SqlBody } from '../bodies/SqlBody';
import type { SqlContent, SqlResult } from '../types';

const mockContent: SqlContent = {
  query: 'SELECT sample_id, organism FROM metagenomes',
  dataSource: 'nmdc',
};

const mockResult: SqlResult = {
  columns: [
    { name: 'sample_id', type: 'string' },
    { name: 'organism', type: 'string' },
  ],
  rows: [
    { sample_id: 'SMP001', organism: 'E. coli' },
    { sample_id: 'SMP002', organism: 'B. subtilis' },
  ],
  rowCount: 2,
  truncated: false,
};

describe('SqlBody', () => {
  it('renders query in code block', () => {
    render(<SqlBody content={mockContent} result={mockResult} status="complete" />);
    expect(screen.getByText(mockContent.query)).toBeInTheDocument();
  });

  it('renders data source label', () => {
    render(<SqlBody content={mockContent} result={mockResult} status="complete" />);
    expect(screen.getByText('nmdc')).toBeInTheDocument();
  });

  it('renders result table with columns and rows', () => {
    render(<SqlBody content={mockContent} result={mockResult} status="complete" />);
    expect(screen.getByText('sample_id')).toBeInTheDocument();
    expect(screen.getByText('organism')).toBeInTheDocument();
    expect(screen.getByText('SMP001')).toBeInTheDocument();
    expect(screen.getByText('E. coli')).toBeInTheDocument();
  });

  it('shows row count', () => {
    render(<SqlBody content={mockContent} result={mockResult} status="complete" />);
    expect(screen.getByText('2 rows')).toBeInTheDocument();
  });

  it('shows truncated badge when result is truncated', () => {
    const truncatedResult = { ...mockResult, truncated: true, rowCount: 1000 };
    render(<SqlBody content={mockContent} result={truncatedResult} status="complete" />);
    expect(screen.getByText('Truncated')).toBeInTheDocument();
  });

  it('shows skeleton when result is null during thinking', () => {
    const { container } = render(
      <SqlBody content={mockContent} result={null} status="thinking" />
    );
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it('uses table role for accessibility', () => {
    render(<SqlBody content={mockContent} result={mockResult} status="complete" />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
