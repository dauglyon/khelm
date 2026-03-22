import { Skeleton } from '@/common/components/Skeleton';
import type { CardStatus, PythonContent, PythonResult } from '../types';
import {
  pythonContainer,
  codeBlock,
  outputSection,
  sectionLabel,
  stdoutPanel,
  stderrPanel,
  returnValueBlock,
  returnLabel,
  figureContainer,
  figureImage,
  figureCaption,
} from './PythonBody.css';

export interface PythonBodyProps {
  content: PythonContent;
  result: PythonResult | null;
  status: CardStatus;
  streamingContent?: string;
}

export function PythonBody({ content, result, status }: PythonBodyProps) {
  return (
    <div className={pythonContainer}>
      <pre className={codeBlock}>
        <code>{content.code}</code>
      </pre>

      {result ? (
        <>
          {result.stdout && (
            <div className={outputSection}>
              <div className={sectionLabel}>Output</div>
              <pre className={stdoutPanel}>{result.stdout}</pre>
            </div>
          )}

          {result.stderr && (
            <div className={outputSection}>
              <div className={sectionLabel}>Errors</div>
              <pre className={stderrPanel}>{result.stderr}</pre>
            </div>
          )}

          {result.returnValue != null && (
            <div className={returnValueBlock}>
              <span className={returnLabel}>Return:</span>
              {JSON.stringify(result.returnValue)}
            </div>
          )}

          {result.figures.length > 0 && (
            <div className={figureContainer}>
              {result.figures.map((fig, idx) => (
                <figure key={idx} style={{ margin: 0 }}>
                  <img
                    src={fig.src}
                    alt={fig.alt}
                    className={figureImage}
                    width={fig.width}
                    height={fig.height}
                  />
                  {fig.caption && (
                    <figcaption className={figureCaption}>
                      {fig.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          )}
        </>
      ) : (status === 'thinking' || status === 'running') ? (
        <div className={outputSection}>
          <Skeleton variant="rect" height={80} />
        </div>
      ) : null}
    </div>
  );
}
