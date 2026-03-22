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
  lowConfidencePill,
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
  const classifiedType = useInputSurfaceStore((s) => s.classifiedType);
  const confidence = useInputSurfaceStore((s) => s.confidence);
  const alternatives = useInputSurfaceStore((s) => s.alternatives);
  const userOverrideType = useInputSurfaceStore((s) => s.userOverrideType);
  const isClassifying = useInputSurfaceStore((s) => s.isClassifying);
  const setUserOverride = useInputSurfaceStore((s) => s.setUserOverride);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const resolvedType = userOverrideType ?? classifiedType;

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
      setUserOverride(type);
      setIsDropdownOpen(false);
    },
    [setUserOverride]
  );

  // Sort types by confidence for dropdown ordering
  const orderedTypes = getOrderedTypes(classifiedType, alternatives);

  // No indicator if nothing classified
  if (!resolvedType && !isClassifying) {
    return null;
  }

  // High confidence: >= 0.80
  const isHigh = confidence !== null && confidence >= 0.80;
  // Medium confidence: 0.50 - 0.79
  const isMedium = confidence !== null && confidence >= 0.50 && confidence < 0.80;
  // Low confidence: < 0.50
  const isLow = confidence !== null && confidence < 0.50;

  // If user overrode, always show solid
  const hasOverride = userOverrideType !== null;

  const containerClasses = [previewContainer, className]
    .filter(Boolean)
    .join(' ');

  // Low confidence: show multiple selectable pills
  if (isLow && !hasOverride && resolvedType === null) {
    const topTypes = orderedTypes.slice(0, 3);
    return (
      <div
        ref={containerRef}
        className={containerClasses}
        style={{ position: 'relative' }}
      >
        {topTypes.map((type) => (
          <button
            key={type}
            type="button"
            className={[
              typePillBase,
              pillColorVariants[type],
              lowConfidencePill,
              isClassifying ? pulseAnimation : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => handleSelectType(type)}
            aria-label={`Select ${TYPE_LABELS[type]}`}
          >
            {TYPE_LABELS[type]}
          </button>
        ))}
      </div>
    );
  }

  // Single pill display (high/medium confidence or user override)
  if (!resolvedType) {
    // Still classifying, show pulse placeholder
    if (isClassifying) {
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
    return null;
  }

  const borderClass = hasOverride || isHigh ? solidBorder : isMedium ? dashedBorder : solidBorder;

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
          pillColorVariants[resolvedType],
          borderClass,
          isClassifying ? pulseAnimation : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        aria-label={`Type: ${TYPE_LABELS[resolvedType]}. Click to change.`}
        data-testid="type-indicator"
      >
        {TYPE_LABELS[resolvedType]}
      </button>

      {isDropdownOpen && (
        <div className={dropdownOverlay} role="listbox" data-testid="type-selector">
          {orderedTypes.map((type) => (
            <div
              key={type}
              className={dropdownItem}
              role="option"
              aria-selected={type === resolvedType}
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

/** Order types by confidence, with alternatives first */
function getOrderedTypes(
  classifiedType: InputType | null,
  alternatives: Array<{ type: InputType; confidence: number }>
): InputType[] {
  if (!classifiedType && alternatives.length === 0) {
    return ALL_TYPES;
  }

  const ranked: Array<{ type: InputType; confidence: number }> = [];

  if (classifiedType) {
    ranked.push({
      type: classifiedType,
      confidence: 1, // Highest priority
    });
  }

  for (const alt of alternatives) {
    if (alt.type !== classifiedType) {
      ranked.push(alt);
    }
  }

  // Add remaining types alphabetically
  const seen = new Set(ranked.map((r) => r.type));
  for (const type of ALL_TYPES) {
    if (!seen.has(type)) {
      ranked.push({ type, confidence: 0 });
    }
  }

  // Sort: ranked items first (by confidence desc), then alphabetical
  ranked.sort((a, b) => b.confidence - a.confidence);

  return ranked.map((r) => r.type);
}
