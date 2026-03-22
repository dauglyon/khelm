import { describe, it, expect } from 'vitest';
import {
  CARD_TYPES,
  CARD_STATUSES,
  cardTypeToInputType,
  cardTypeLabel,
} from '../types';
import type {
  Card,
  Message,
  CardContentMap,
  CardResultMap,
} from '../types';

describe('Card types', () => {
  it('CARD_TYPES has exactly 6 values', () => {
    expect(CARD_TYPES).toHaveLength(6);
    expect(CARD_TYPES).toEqual([
      'sql',
      'python',
      'literature',
      'hypothesis',
      'note',
      'data_ingest',
    ]);
  });

  it('CARD_STATUSES has exactly 4 values', () => {
    expect(CARD_STATUSES).toHaveLength(4);
    expect(CARD_STATUSES).toEqual(['thinking', 'running', 'complete', 'error']);
  });

  it('cardTypeToInputType maps all types correctly', () => {
    expect(cardTypeToInputType('sql')).toBe('sql');
    expect(cardTypeToInputType('python')).toBe('python');
    expect(cardTypeToInputType('literature')).toBe('literature');
    expect(cardTypeToInputType('hypothesis')).toBe('hypothesis');
    expect(cardTypeToInputType('note')).toBe('note');
    expect(cardTypeToInputType('data_ingest')).toBe('dataIngest');
  });

  it('cardTypeLabel returns human-readable labels', () => {
    expect(cardTypeLabel('sql')).toBe('SQL');
    expect(cardTypeLabel('python')).toBe('Python');
    expect(cardTypeLabel('data_ingest')).toBe('Data Ingest');
  });

  it('Card record has all required fields (compile-time check)', () => {
    const card: Card = {
      id: 'test-id',
      shortname: 'test',
      type: 'sql',
      status: 'complete',
      content: { query: 'SELECT 1', dataSource: 'test' },
      result: { columns: [], rows: [], rowCount: 0, truncated: false },
      error: null,
      references: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      createdBy: 'user-1',
      lockedBy: null,
      sessionId: 'session-1',
    };
    expect(card.id).toBe('test-id');
    expect(card.type).toBe('sql');
  });

  it('Message has all required fields', () => {
    const msg: Message = {
      id: '1',
      role: 'user',
      content: 'hello',
      toolCall: null,
      timestamp: '2024-01-01T00:00:00Z',
      status: 'complete',
    };
    expect(msg.role).toBe('user');
  });

  it('NoteContent result is null', () => {
    // Verify NoteResult type is null per spec
    type NoteResult = CardResultMap['note'];
    const result: NoteResult = null;
    expect(result).toBeNull();
  });

  it('Type discrimination works for content', () => {
    const sqlContent: CardContentMap['sql'] = {
      query: 'SELECT 1',
      dataSource: 'test',
    };
    expect(sqlContent.query).toBe('SELECT 1');

    const noteContent: CardContentMap['note'] = { text: 'hello' };
    expect(noteContent.text).toBe('hello');
  });
});
