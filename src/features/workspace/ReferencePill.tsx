import { Chip } from '@/common/components';
import type { InputType } from '@/theme';
import { useCard, useCardShortname } from './store/selectors';
import { useScrollToCard } from './hooks/useScrollToCard';
import type { CardType } from './store/types';
import { pillButton, deletedPill } from './ReferencePill.css';

export interface ReferencePillProps {
  /** ID of the referenced card */
  cardId: string;
}

/** Maps workspace CardType to design-system InputType */
const cardTypeToInputType: Record<CardType, InputType> = {
  sql: 'sql',
  python: 'python',
  literature: 'literature',
  hypothesis: 'hypothesis',
  note: 'note',
  data_ingest: 'dataIngest',
};

export function ReferencePill({ cardId }: ReferencePillProps) {
  const card = useCard(cardId);
  const shortname = useCardShortname(cardId);
  const scrollToCard = useScrollToCard();

  // Deleted card state
  if (!card || !shortname) {
    return (
      <span className={deletedPill} aria-label="Deleted card reference">
        <Chip inputType="note" label="@deleted" size="sm" />
      </span>
    );
  }

  const inputType = cardTypeToInputType[card.type];

  const handleClick = () => {
    scrollToCard(cardId);
  };

  return (
    <button
      type="button"
      className={pillButton}
      onClick={handleClick}
      title={`${card.shortname} (${card.status})`}
      aria-label={`Reference to card ${shortname}`}
    >
      <Chip inputType={inputType} label={`@${shortname}`} size="sm" />
    </button>
  );
}
