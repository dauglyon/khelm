import { Chip } from '@/common/components/Chip';
import { Skeleton } from '@/common/components/Skeleton';
import { cardTypeToInputType } from '../types';
import type {
  CardStatus,
  HypothesisContent,
  HypothesisResult,
  SuggestedQuery,
} from '../types';
import {
  hypContainer,
  claimCallout,
  claimText,
  evidenceText,
  domainTag,
  analysisSection,
  confidenceLabel,
  chipsContainer,
} from './HypothesisBody.css';

export interface HypothesisBodyProps {
  content: HypothesisContent;
  result: HypothesisResult | null;
  status: CardStatus;
  streamingContent?: string;
  onSuggestedQueryClick?: (query: SuggestedQuery) => void;
}

function getConfidenceColor(confidence: number): string {
  if (confidence < 0.4) return '#C53030';
  if (confidence < 0.7) return '#B8660D';
  return '#1A7F5A';
}

export function HypothesisBody({
  content,
  result,
  status,
  streamingContent,
  onSuggestedQueryClick,
}: HypothesisBodyProps) {
  const displayContent =
    status === 'running' && streamingContent
      ? streamingContent
      : result?.analysis;

  return (
    <div className={hypContainer}>
      <blockquote className={claimCallout}>
        <p className={claimText}>{content.claim}</p>
        {content.evidence && (
          <div className={evidenceText}>{content.evidence}</div>
        )}
        {content.domain && (
          <span className={domainTag}>{content.domain}</span>
        )}
      </blockquote>

      {displayContent ? (
        <div className={analysisSection}>{displayContent}</div>
      ) : status === 'thinking' || status === 'running' ? (
        <Skeleton variant="text" lines={3} />
      ) : null}

      {result?.confidence != null && (
        <div
          className={confidenceLabel}
          style={{ color: getConfidenceColor(result.confidence) }}
        >
          Confidence: {Math.round(result.confidence * 100)}%
        </div>
      )}

      {status === 'complete' &&
        result?.suggestedQueries &&
        result.suggestedQueries.length > 0 && (
          <div className={chipsContainer}>
            {result.suggestedQueries.map((sq, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSuggestedQueryClick?.(sq)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
                aria-label={`Create ${sq.label}`}
              >
                <Chip
                  inputType={cardTypeToInputType(sq.type)}
                  label={sq.label}
                  size="sm"
                />
              </button>
            ))}
          </div>
        )}
    </div>
  );
}
