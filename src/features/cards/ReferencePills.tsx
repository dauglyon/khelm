import { ReferencePill } from './ReferencePill';
import { pillsContainer } from './ReferencePills.css';

export interface ReferencePillsProps {
  references: string[];
}

export function ReferencePills({ references }: ReferencePillsProps) {
  if (references.length === 0) return null;

  return (
    <div className={pillsContainer}>
      {references.map((refId) => (
        <ReferencePill key={refId} cardId={refId} />
      ))}
    </div>
  );
}
