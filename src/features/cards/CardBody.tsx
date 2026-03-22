import type { CardType, CardContent, CardResult, CardStatus } from './types';
import { NoteBody } from './bodies/NoteBody';
import { SqlBody } from './bodies/SqlBody';
import { PythonBody } from './bodies/PythonBody';
import { LiteratureBody } from './bodies/LiteratureBody';
import { DataIngestBody } from './bodies/DataIngestBody';
import type { NoteContent } from './types';
import type { SqlContent, SqlResult } from './types';
import type { PythonContent, PythonResult } from './types';
import type { LiteratureContent, LiteratureResult } from './types';
import type { DataIngestContent, DataIngestResult } from './types';
import { cardTypeLabel } from './types';

export interface CardBodyProps {
  type: CardType;
  content: CardContent;
  result: CardResult | null;
  status: CardStatus;
  streamingContent?: string;
  cardId: string;
}

export function CardBody({
  type,
  content,
  result,
  status,
  streamingContent,
  cardId,
}: CardBodyProps) {
  switch (type) {
    case 'note':
      return (
        <NoteBody content={content as NoteContent} cardId={cardId} />
      );
    case 'sql':
      return (
        <SqlBody
          content={content as SqlContent}
          result={result as SqlResult | null}
          status={status}
          streamingContent={streamingContent}
        />
      );
    case 'python':
      return (
        <PythonBody
          content={content as PythonContent}
          result={result as PythonResult | null}
          status={status}
          streamingContent={streamingContent}
        />
      );
    case 'literature':
      return (
        <LiteratureBody
          content={content as LiteratureContent}
          result={result as LiteratureResult | null}
          status={status}
        />
      );
    case 'data_ingest':
      return (
        <DataIngestBody
          content={content as DataIngestContent}
          result={result as DataIngestResult | null}
          status={status}
        />
      );
    default:
      return (
        <div style={{ padding: '16px', color: '#6B7268' }}>
          {cardTypeLabel(type)} body coming soon
        </div>
      );
  }
}
