import { useCardData } from './store';
import { useCardShortname } from '@/features/workspace';
import { useScrollToCard } from '@/features/workspace';
import { cardTypeToInputType } from './types';
import { pillBase, deletedPill } from './ReferencePills.css';

export interface ReferencePillProps {
  cardId: string;
}

// Direct color values for inline styles (since vanilla-extract vars are CSS custom props)
const typeColors: Record<string, { bg: string; border: string; fg: string }> = {
  sql: { bg: '#E3EDF7', border: '#B0CDE4', fg: '#2B6CB0' },
  python: { bg: '#EDE5F5', border: '#C4B0DA', fg: '#7B4EA3' },
  literature: { bg: '#E0F2EA', border: '#A8D8C4', fg: '#1A7F5A' },
  hypothesis: { bg: '#FBF0E0', border: '#E4C890', fg: '#B8660D' },
  note: { bg: '#F5F0E7', border: '#D6C8AD', fg: '#7A6340' },
  dataIngest: { bg: '#E0F2F2', border: '#A8D6D6', fg: '#2D8E8E' },
};

export function ReferencePill({ cardId }: ReferencePillProps) {
  const card = useCardData(cardId);
  const shortname = useCardShortname(cardId);
  const scrollToCard = useScrollToCard();

  if (!card || !shortname) {
    return (
      <span className={deletedPill} data-testid="deleted-pill">
        deleted card
      </span>
    );
  }

  const inputType = cardTypeToInputType(card.type);
  const colors = typeColors[inputType] ?? typeColors.note;

  return (
    <button
      type="button"
      className={pillBase}
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
        color: colors.fg,
      }}
      onClick={() => scrollToCard(cardId)}
      title={`${shortname} (${card.status})`}
      aria-label={`Go to card: ${shortname}`}
    >
      @{shortname}
    </button>
  );
}
