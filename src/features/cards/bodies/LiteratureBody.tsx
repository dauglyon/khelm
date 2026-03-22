import { useState, useCallback } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { Skeleton } from '@/common/components/Skeleton';
import type { CardStatus, LiteratureContent, LiteratureResult } from '../types';
import {
  litContainer,
  searchTerms,
  searchTermTag,
  publicationList,
  publicationItem,
  pubTitle,
  pubAuthors,
  pubSource,
  pubAbstract,
  resultCount,
} from './LiteratureBody.css';

export interface LiteratureBodyProps {
  content: LiteratureContent;
  result: LiteratureResult | null;
  status: CardStatus;
}

function formatAuthors(authors: string[]): string {
  if (authors.length <= 3) return authors.join(', ');
  return `${authors.slice(0, 3).join(', ')} et al.`;
}

export function LiteratureBody({
  content,
  result,
  status,
}: LiteratureBodyProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleAbstract = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return (
    <div className={litContainer}>
      <div className={searchTerms}>
        {content.searchTerms.map((term) => (
          <span key={term} className={searchTermTag}>
            {term}
          </span>
        ))}
      </div>

      {result ? (
        <>
          <div className={publicationList}>
            {result.hits.map((pub) => (
              <div
                key={pub.id}
                className={publicationItem}
                onClick={() => toggleAbstract(pub.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleAbstract(pub.id);
                  }
                }}
                aria-expanded={expandedIds.has(pub.id)}
              >
                <div className={pubTitle}>{pub.title}</div>
                <div className={pubAuthors}>
                  {formatAuthors(pub.authors)} &middot; {pub.year}
                </div>
                <div className={pubSource}>{pub.source}</div>

                <AnimatePresence>
                  {expandedIds.has(pub.id) && pub.abstract && (
                    <m.div
                      key={`abstract-${pub.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: 0.2,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className={pubAbstract}>{pub.abstract}</div>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
          <div className={resultCount}>
            Showing {result.hits.length} of {result.totalCount} results
          </div>
        </>
      ) : status === 'thinking' || status === 'running' ? (
        <Skeleton variant="rect" height={120} />
      ) : null}
    </div>
  );
}
