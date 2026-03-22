/**
 * Card domain types and data model.
 * This is the foundation for the entire card domain.
 * All types match the architecture spec in architecture/card.md.
 */

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export type CardType =
  | 'sql'
  | 'python'
  | 'literature'
  | 'hypothesis'
  | 'note'
  | 'data_ingest';

export type CardStatus = 'thinking' | 'running' | 'complete' | 'error';

export const CARD_TYPES: readonly CardType[] = [
  'sql',
  'python',
  'literature',
  'hypothesis',
  'note',
  'data_ingest',
] as const;

export const CARD_STATUSES: readonly CardStatus[] = [
  'thinking',
  'running',
  'complete',
  'error',
] as const;

// ---------------------------------------------------------------------------
// Supporting types
// ---------------------------------------------------------------------------

export interface Column {
  name: string;
  type: string;
}

export type Row = Record<string, unknown>;

export interface Figure {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface Publication {
  id: string;
  title: string;
  authors: string[];
  year: number;
  source: string;
  abstract?: string;
  doi?: string;
  url?: string;
}

export interface SuggestedQuery {
  type: CardType;
  label: string;
  content: string;
}

export interface SchemaField {
  name: string;
  inferredType: string;
  sampleValues: string[];
  nullable: boolean;
}

export interface LitFilters {
  yearFrom?: number;
  yearTo?: number;
  sources?: string[];
}

// ---------------------------------------------------------------------------
// Content shapes (discriminated by CardType)
// ---------------------------------------------------------------------------

export interface SqlContent {
  query: string;
  dataSource: string;
}

export interface PythonContent {
  code: string;
  language: 'python';
}

export interface LiteratureContent {
  searchTerms: string[];
  filters?: LitFilters;
}

export interface HypothesisContent {
  claim: string;
  evidence?: string;
  domain?: string;
}

export interface NoteContent {
  text: string;
}

export interface DataIngestContent {
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface CardContentMap {
  sql: SqlContent;
  python: PythonContent;
  literature: LiteratureContent;
  hypothesis: HypothesisContent;
  note: NoteContent;
  data_ingest: DataIngestContent;
}

export type CardContent = CardContentMap[CardType];

// ---------------------------------------------------------------------------
// Result shapes (discriminated by CardType)
// ---------------------------------------------------------------------------

export interface SqlResult {
  columns: Column[];
  rows: Row[];
  rowCount: number;
  truncated: boolean;
}

export interface PythonResult {
  stdout: string;
  stderr: string;
  returnValue: unknown;
  figures: Figure[];
}

export interface LiteratureResult {
  hits: Publication[];
  totalCount: number;
}

export interface HypothesisResult {
  analysis: string;
  suggestedQueries: SuggestedQuery[];
  confidence?: number;
}

export type NoteResult = null;

export interface DataIngestResult {
  schema: SchemaField[];
  sampleRows: Row[];
  totalRows: number;
  uploadId: string;
}

export interface CardResultMap {
  sql: SqlResult;
  python: PythonResult;
  literature: LiteratureResult;
  hypothesis: HypothesisResult;
  note: NoteResult;
  data_ingest: DataIngestResult;
}

export type CardResult = CardResultMap[CardType];

// ---------------------------------------------------------------------------
// Error shape
// ---------------------------------------------------------------------------

export interface CardError {
  code: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Card record
// ---------------------------------------------------------------------------

export interface Card {
  id: string;
  shortname: string;
  type: CardType;
  status: CardStatus;
  content: CardContent;
  result: CardResult | null;
  error: CardError | null;
  references: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lockedBy: string | null;
  sessionId: string;
}

// ---------------------------------------------------------------------------
// Chat message types
// ---------------------------------------------------------------------------

export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageStatus =
  | 'pending'
  | 'streaming'
  | 'complete'
  | 'error'
  | 'aborted';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  toolCall: { name: string; params: Record<string, unknown> } | null;
  timestamp: string;
  status: MessageStatus;
}

// ---------------------------------------------------------------------------
// Utility: map CardType to design-system InputType
// ---------------------------------------------------------------------------

import type { InputType } from '@/theme';

const cardTypeToInputTypeMap: Record<CardType, InputType> = {
  sql: 'sql',
  python: 'python',
  literature: 'literature',
  hypothesis: 'hypothesis',
  note: 'note',
  data_ingest: 'dataIngest',
};

export function cardTypeToInputType(type: CardType): InputType {
  return cardTypeToInputTypeMap[type];
}

export function cardTypeLabel(type: CardType): string {
  const labels: Record<CardType, string> = {
    sql: 'SQL',
    python: 'Python',
    literature: 'Literature',
    hypothesis: 'Hypothesis',
    note: 'Note',
    data_ingest: 'Data Ingest',
  };
  return labels[type];
}
