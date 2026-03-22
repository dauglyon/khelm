import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardComponent } from '../Card';
import { useCardStore } from '../store';
import type { Card } from '../types';

function createMockCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 'card-1',
    shortname: 'Test',
    type: 'sql',
    status: 'complete',
    content: { query: 'SELECT 1', dataSource: 'test' },
    result: null,
    error: null,
    references: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'user-1',
    lockedBy: null,
    sessionId: 'session-1',
    ...overrides,
  };
}

describe('Card Type Rendering Integration', () => {
  beforeEach(() => {
    useCardStore.setState({
      cards: new Map(),
      streamingContent: new Map(),
      chatStates: new Map(),
    });
  });

  it('renders SQL card with code block and table', () => {
    useCardStore.getState().setCard(
      createMockCard({
        type: 'sql',
        content: { query: 'SELECT name FROM users', dataSource: 'main' },
        result: {
          columns: [{ name: 'name', type: 'string' }],
          rows: [{ name: 'Alice' }, { name: 'Bob' }],
          rowCount: 2,
          truncated: false,
        },
      })
    );
    render(<CardComponent cardId="card-1" />);
    expect(screen.getByText('SELECT name FROM users')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('2 rows')).toBeInTheDocument();
    expect(screen.getByText('SQL')).toBeInTheDocument();
  });

  it('renders Python card with code and output', () => {
    useCardStore.getState().setCard(
      createMockCard({
        type: 'python',
        shortname: 'Python Analysis',
        content: { code: 'print("hello")', language: 'python' as const },
        result: {
          stdout: 'hello\n',
          stderr: '',
          returnValue: null,
          figures: [],
        },
      })
    );
    render(<CardComponent cardId="card-1" />);
    expect(screen.getByText('print("hello")')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
  });

  it('renders Literature card with publications', () => {
    useCardStore.getState().setCard(
      createMockCard({
        type: 'literature',
        shortname: 'Lit Search',
        content: { searchTerms: ['metagenome'] },
        result: {
          hits: [
            {
              id: 'p1',
              title: 'Metagenomics Study',
              authors: ['Smith'],
              year: 2024,
              source: 'Nature',
            },
          ],
          totalCount: 50,
        },
      })
    );
    render(<CardComponent cardId="card-1" />);
    expect(screen.getByText('Metagenomics Study')).toBeInTheDocument();
    expect(screen.getByText('Literature')).toBeInTheDocument();
    expect(screen.getByText('Showing 1 of 50 results')).toBeInTheDocument();
  });

  it('renders Note card with editable textarea', () => {
    useCardStore.getState().setCard(
      createMockCard({
        type: 'note',
        shortname: 'My Note',
        content: { text: 'Note content here' },
        result: null,
      })
    );
    render(<CardComponent cardId="card-1" />);
    expect(screen.getByDisplayValue('Note content here')).toBeInTheDocument();
    expect(screen.getByText('Note')).toBeInTheDocument();
  });

  it('renders Data Ingest card with file info and schema', () => {
    useCardStore.getState().setCard(
      createMockCard({
        type: 'data_ingest',
        shortname: 'Data Upload',
        content: { fileName: 'data.csv', fileSize: 1024, mimeType: 'text/csv' },
        result: {
          schema: [
            { name: 'id', inferredType: 'string', sampleValues: ['1', '2'], nullable: false },
          ],
          sampleRows: [{ id: '1' }, { id: '2' }],
          totalRows: 100,
          uploadId: 'upload-xyz',
        },
      })
    );
    render(<CardComponent cardId="card-1" />);
    expect(screen.getByText('data.csv')).toBeInTheDocument();
    expect(screen.getByText('Data Ingest')).toBeInTheDocument();
  });

  it('all card types render header with correct type badge', () => {
    const types = [
      { type: 'sql' as const, label: 'SQL', content: { query: 'x', dataSource: 'y' } },
      { type: 'python' as const, label: 'Python', content: { code: 'x', language: 'python' as const } },
      { type: 'literature' as const, label: 'Literature', content: { searchTerms: ['x'] } },
      { type: 'note' as const, label: 'Note', content: { text: 'x' } },
      { type: 'data_ingest' as const, label: 'Data Ingest', content: { fileName: 'x', fileSize: 0, mimeType: 'x' } },
    ];

    for (const { type, label, content } of types) {
      useCardStore.setState({
        cards: new Map(),
        streamingContent: new Map(),
        chatStates: new Map(),
      });
      useCardStore.getState().setCard(
        createMockCard({ type, content, result: null, status: 'thinking' })
      );
      const { unmount } = render(<CardComponent cardId="card-1" />);
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    }
  });
});
