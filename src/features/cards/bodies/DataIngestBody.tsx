import { Skeleton } from '@/common/components/Skeleton';
import type { CardStatus, DataIngestContent, DataIngestResult } from '../types';
import {
  ingestContainer,
  fileInfo,
  progressContainer,
  progressFill,
  sectionDivider,
  schemaTable,
  schemaHeader,
  schemaCell,
  schemaCellMono,
  sampleValues,
  sampleTable,
  sampleHeader,
  sampleCell,
  totalRows,
  uploadIdText,
} from './DataIngestBody.css';

export interface DataIngestBodyProps {
  content: DataIngestContent;
  result: DataIngestResult | null;
  status: CardStatus;
  uploadProgress?: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function DataIngestBody({
  content,
  result,
  status,
  uploadProgress,
}: DataIngestBodyProps) {
  return (
    <div className={ingestContainer}>
      <div className={fileInfo}>
        <span>{content.fileName}</span>
        <span>{formatFileSize(content.fileSize)}</span>
        <span>{content.mimeType}</span>
      </div>

      {status === 'running' && uploadProgress != null && (
        <div className={progressContainer}>
          <div
            className={progressFill}
            style={{ width: `${uploadProgress}%` }}
            role="progressbar"
            aria-valuenow={uploadProgress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      )}

      {result ? (
        <>
          <table className={schemaTable} role="table">
            <thead>
              <tr>
                <th className={schemaHeader} scope="col">
                  Field
                </th>
                <th className={schemaHeader} scope="col">
                  Type
                </th>
                <th className={schemaHeader} scope="col">
                  Nullable
                </th>
                <th className={schemaHeader} scope="col">
                  Sample Values
                </th>
              </tr>
            </thead>
            <tbody>
              {result.schema.map((field) => (
                <tr key={field.name}>
                  <td className={schemaCell}>{field.name}</td>
                  <td className={`${schemaCell} ${schemaCellMono}`}>
                    {field.inferredType}
                  </td>
                  <td className={schemaCell}>
                    {field.nullable ? 'yes' : 'no'}
                  </td>
                  <td className={`${schemaCell} ${sampleValues}`}>
                    {field.sampleValues.join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={sectionDivider} />

          {result.sampleRows.length > 0 && (
            <table className={sampleTable} role="table">
              <thead>
                <tr>
                  {result.schema.map((field) => (
                    <th
                      key={field.name}
                      className={sampleHeader}
                      scope="col"
                    >
                      {field.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.sampleRows.slice(0, 10).map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {result.schema.map((field) => (
                      <td key={field.name} className={sampleCell}>
                        {String(row[field.name] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className={totalRows}>
            Total: {result.totalRows.toLocaleString()} rows
          </div>
          <div className={uploadIdText}>{result.uploadId}</div>
        </>
      ) : status === 'thinking' ? (
        <Skeleton variant="rect" height={120} />
      ) : null}
    </div>
  );
}
