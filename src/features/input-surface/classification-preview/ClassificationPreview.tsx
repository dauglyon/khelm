import { useState, useEffect, useRef, useCallback } from 'react';
import type { InputType } from '@/theme';
import { useInputSurfaceStore } from '../store/useInputSurfaceStore';
import {
  previewContainer,
  typePillBase,
  solidBorder,
  dashedBorder,
  pulseAnimation,
  pillColorVariants,
  dropdownOverlay,
  dropdownItem,
  dropdownColorDot,
} from './classificationPreview.css';

/** Display labels for each input type */
const TYPE_LABELS: Record<InputType, string> = {
  sql: 'SQL',
  python: 'Python',
  literature: 'Literature',
  chat: 'Chat',
  note: 'Note',
  dataIngest: 'Data Ingest',
  task: 'Task',
};

/** Runtime color map for dropdown dots */
const TYPE_COLORS: Record<InputType, string> = {
  sql: '#2B6CB0',
  python: '#7B4EA3',
  literature: '#1A7F5A',
  chat: '#B8660D',
  note: '#7A6340',
  dataIngest: '#2D8E8E',
  task: '#7A3B5E',
};

const ALL_TYPES: InputType[] = [
  'sql',
  'python',
  'literature',
  'chat',
  'note',
  'dataIngest',
  'task',
];

export interface ClassificationPreviewProps {
  className?: string;
}

export function ClassificationPreview({ className }: ClassificationPreviewProps) {
  const classifiedTypes = useInputSurfaceStore((s) => s.classifiedTypes);
  const alternatives = useInputSurfaceStore((s) => s.alternatives);
  const userOverrideTypes = useInputSurfaceStore((s) => s.userOverrideTypes);
  const isClassifying = useInputSurfaceStore((s) => s.isClassifying);
  const setUserOverrideTypes = useInputSurfaceStore((s) => s.setUserOverrideTypes);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Resolved pipeline: user override takes precedence
  const resolvedTypes = userOverrideTypes ?? classifiedTypes;
  // Primary type is the first element in the pipeline
  const primaryType = resolvedTypes ? (resolvedTypes[0] as InputType) : null;
  const isCompound = resolvedTypes !== null && resolvedTypes.length > 1;
  const hasOverride = userOverrideTypes !== null;
  const hasAlternatives = alternatives !== null && alternatives.length > 0;

  // Close dropdown on click outside
  useEffect(() => {
    if (!isDropdownOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isDropdownOpen]);

  const handleSelectType = useCallback(
    (type: InputType) => {
      setUserOverrideTypes([type]);
      setIsDropdownOpen(false);
    },
    [setUserOverrideTypes]
  );

  // Order types for dropdown: classified first, then alternatives' first elements, then rest
  const orderedTypes = getOrderedTypes(classifiedTypes, alternatives);

  // No indicator if nothing classified
  if (!primaryType && !isClassifying) {
    return null;
  }

  const containerClasses = [previewContainer, className]
    .filter(Boolean)
    .join(' ');

  // Still classifying, show pulse placeholder
  if (!primaryType) {
    return (
      <div ref={containerRef} className={containerClasses}>
        <span
          className={[typePillBase, pulseAnimation].join(' ')}
          style={{
            width: '60px',
            backgroundColor: '#e0e0e0',
            borderColor: '#d0d0d0',
            borderStyle: 'solid',
          }}
        >
          &nbsp;
        </span>
      </div>
    );
  }

  // Use dashed border when there are alternatives and no override (uncertain classification)
  const borderClass = hasOverride || !hasAlternatives ? solidBorder : dashedBorder;

  // Build label: show compound indicator if pipeline has >1 type
  const pillLabel = isCompound
    ? resolvedTypes!.map((t) => TYPE_LABELS[t as InputType] ?? t).join(' → ')
    : TYPE_LABELS[primaryType];

  return (
    <div
      ref={containerRef}
      className={containerClasses}
      style={{ position: 'relative' }}
    >
      <button
        type="button"
        className={[
          typePillBase,
          pillColorVariants[primaryType],
          borderClass,
          isClassifying ? pulseAnimation : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        aria-label={`Type: ${pillLabel}. Click to change.`}
        data-testid="type-indicator"
      >
        {pillLabel}
      </button>

      {isDropdownOpen && (
        <div className={dropdownOverlay} role="listbox" data-testid="type-selector">
          {orderedTypes.map((type) => (
            <div
              key={type}
              className={dropdownItem}
              role="option"
              aria-selected={type === primaryType}
              onClick={() => handleSelectType(type)}
            >
              <span
                className={dropdownColorDot}
                style={{ backgroundColor: TYPE_COLORS[type] }}
              />
              {TYPE_LABELS[type]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Order types for dropdown: classified pipeline's first type first,
 * then alternatives' first types, then remaining types.
 */
function getOrderedTypes(
  classifiedTypes: string[] | null,
  alternatives: string[][] | null
): InputType[] {
  const primaryType = classifiedTypes ? (classifiedTypes[0] as InputType) : null;

  if (!primaryType && (!alternatives || alternatives.length === 0)) {
    return ALL_TYPES;
  }

  const seen = new Set<InputType>();
  const ranked: InputType[] = [];

  if (primaryType) {
    ranked.push(primaryType);
    seen.add(primaryType);
  }

  if (alternatives) {
    for (const alt of alternatives) {
      if (alt.length > 0) {
        const altType = alt[0] as InputType;
        if (!seen.has(altType)) {
          ranked.push(altType);
          seen.add(altType);
        }
      }
    }
  }

  // Add remaining types in their canonical order
  for (const type of ALL_TYPES) {
    if (!seen.has(type)) {
      ranked.push(type);
    }
  }

  return ranked;
}
