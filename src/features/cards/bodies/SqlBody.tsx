import { Chip } from '@/common/components/Chip';
import { Skeleton } from '@/common/components/Skeleton';
import type { CardStatus, SqlContent, SqlResult } from '../types';
import {
  sqlContainer,
  codeBlock,
  dataSourceLabel,
  tableContainer,
  resultTable,
  tableHeader,
  tableCell,
  tableRowEven,
  rowCount,
} from './SqlBody.css';

export interface SqlBodyProps {
  content: SqlContent;
  result: SqlResult | null;
  status: CardStatus;
  streamingContent?: string;
}

export function SqlBody({ content, result, status }: SqlBodyProps) {
  return (
    <div className={sqlContainer}>
      <pre className={codeBlock}>
        <code>{content.query}</code>
      </pre>
      <div className={dataSourceLabel}>{content.dataSource}</div>

      {result && result.rows.length > 0 ? (
        <>
          <div className={tableContainer}>
            <table className={resultTable} role="table">
              <thead>
                <tr>
                  {result.columns.map((col) => (
                    <th
                      key={col.name}
                      className={tableHeader}
                      scope="col"
                    >
                      {col.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className={rowIdx % 2 === 0 ? undefined : tableRowEven}
                  >
                    {result.columns.map((col) => {
                      const val = String(row[col.name] ?? '');
                      return (
                        <td
                          key={col.name}
                          className={tableCell}
                          title={val}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={rowCount}>
            <span>{result.rowCount} rows</span>
            {result.truncated && (
              <Chip inputType="hypothesis" label="Truncated" size="sm" />
            )}
          </div>
        </>
      ) : (status === 'thinking' || status === 'running') && !result ? (
        <Skeleton variant="rect" height={120} />
      ) : null}
    </div>
  );
}
