import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardBody } from '../CardBody';

describe('CardBody', () => {
  it('renders NoteBody for note type', () => {
    render(
      <CardBody
        type="note"
        content={{ text: 'Hello world' }}
        result={null}
        status="complete"
        cardId="card-1"
      />
    );
    expect(screen.getByDisplayValue('Hello world')).toBeInTheDocument();
  });

  it('renders SqlBody for sql type', () => {
    render(
      <CardBody
        type="sql"
        content={{ query: 'SELECT 1', dataSource: 'test' }}
        result={null}
        status="thinking"
        cardId="card-1"
      />
    );
    expect(screen.getByText('SELECT 1')).toBeInTheDocument();
  });

  it('renders PythonBody for python type', () => {
    render(
      <CardBody
        type="python"
        content={{ code: 'print("hi")', language: 'python' as const }}
        result={null}
        status="thinking"
        cardId="card-1"
      />
    );
    expect(screen.getByText('print("hi")')).toBeInTheDocument();
  });

  it('renders LiteratureBody for literature type', () => {
    render(
      <CardBody
        type="literature"
        content={{ searchTerms: ['test'] }}
        result={null}
        status="thinking"
        cardId="card-1"
      />
    );
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('renders HypothesisBody for hypothesis type', () => {
    render(
      <CardBody
        type="hypothesis"
        content={{ claim: 'Test claim' }}
        result={null}
        status="thinking"
        cardId="card-1"
      />
    );
    expect(screen.getByText('Test claim')).toBeInTheDocument();
  });

  it('renders DataIngestBody for data_ingest type', () => {
    render(
      <CardBody
        type="data_ingest"
        content={{ fileName: 'test.csv', fileSize: 1024, mimeType: 'text/csv' }}
        result={null}
        status="thinking"
        cardId="card-1"
      />
    );
    expect(screen.getByText('test.csv')).toBeInTheDocument();
  });
});
