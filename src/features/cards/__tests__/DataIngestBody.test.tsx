import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataIngestBody } from '../bodies/DataIngestBody';
import type { DataIngestContent, DataIngestResult } from '../types';

const mockContent: DataIngestContent = {
  fileName: 'metagenome_samples.csv',
  fileSize: 2500000,
  mimeType: 'text/csv',
};

const mockResult: DataIngestResult = {
  schema: [
    { name: 'sample_id', inferredType: 'string', sampleValues: ['SMP001', 'SMP002'], nullable: false },
    { name: 'depth_m', inferredType: 'number', sampleValues: ['10.5', '23.1'], nullable: false },
    { name: 'collected', inferredType: 'date', sampleValues: ['2024-01-15', ''], nullable: true },
  ],
  sampleRows: [
    { sample_id: 'SMP001', depth_m: '10.5', collected: '2024-01-15' },
    { sample_id: 'SMP002', depth_m: '23.1', collected: '' },
  ],
  totalRows: 15234,
  uploadId: 'upload-abc123',
};

describe('DataIngestBody', () => {
  it('renders file name', () => {
    render(<DataIngestBody content={mockContent} result={mockResult} status="complete" />);
    expect(screen.getByText('metagenome_samples.csv')).toBeInTheDocument();
  });

  it('formats file size as MB', () => {
    render(<DataIngestBody content={mockContent} result={mockResult} status="complete" />);
    expect(screen.getByText('2.4 MB')).toBeInTheDocument();
  });

  it('renders mime type', () => {
    render(<DataIngestBody content={mockContent} result={mockResult} status="complete" />);
    expect(screen.getByText('text/csv')).toBeInTheDocument();
  });

  it('renders schema table with field names and types', () => {
    render(<DataIngestBody content={mockContent} result={mockResult} status="complete" />);
    // Field names appear in both schema and sample tables
    expect(screen.getAllByText('sample_id').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('string').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('number').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('date').length).toBeGreaterThanOrEqual(1);
  });

  it('shows nullable info', () => {
    render(<DataIngestBody content={mockContent} result={mockResult} status="complete" />);
    const yesCells = screen.getAllByText('yes');
    const noCells = screen.getAllByText('no');
    expect(yesCells.length).toBeGreaterThan(0);
    expect(noCells.length).toBeGreaterThan(0);
  });

  it('renders total row count with locale formatting', () => {
    render(<DataIngestBody content={mockContent} result={mockResult} status="complete" />);
    expect(screen.getByText(/15,234 rows/)).toBeInTheDocument();
  });

  it('shows progress bar during running status', () => {
    render(
      <DataIngestBody
        content={mockContent}
        result={null}
        status="running"
        uploadProgress={45}
      />
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows skeleton when result is null during thinking', () => {
    const { container } = render(
      <DataIngestBody content={mockContent} result={null} status="thinking" />
    );
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it('renders upload ID', () => {
    render(<DataIngestBody content={mockContent} result={mockResult} status="complete" />);
    expect(screen.getByText('upload-abc123')).toBeInTheDocument();
  });
});
