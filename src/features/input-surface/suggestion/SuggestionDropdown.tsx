import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import type { InputType } from '@/theme';
import {
  dropdownContainer,
  dropdownItem,
  dropdownItemActive,
  itemShortname,
  itemTitle,
  typeIndicator,
  emptyState,
} from './suggestionDropdown.css';

export interface SuggestionCard {
  id: string;
  shortname: string;
  title: string;
  type: InputType;
}

/** Runtime color map for type indicator dots (not using vanilla-extract vars since we need JS values) */
const typeColors: Record<InputType, string> = {
  sql: '#2B6CB0',
  python: '#7B4EA3',
  literature: '#1A7F5A',
  hypothesis: '#B8660D',
  note: '#7A6340',
  dataIngest: '#2D8E8E',
};

export interface SuggestionDropdownProps {
  items: SuggestionCard[];
  command: (item: SuggestionCard) => void;
}

export interface SuggestionDropdownRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const SuggestionDropdown = forwardRef<
  SuggestionDropdownRef,
  SuggestionDropdownProps
>(function SuggestionDropdown({ items, command }, ref) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((prev) =>
          prev <= 0 ? items.length - 1 : prev - 1
        );
        return true;
      }

      if (event.key === 'ArrowDown') {
        setSelectedIndex((prev) =>
          prev >= items.length - 1 ? 0 : prev + 1
        );
        return true;
      }

      if (event.key === 'Enter') {
        const item = items[selectedIndex];
        if (item) {
          command(item);
        }
        return true;
      }

      if (event.key === 'Escape') {
        return true;
      }

      return false;
    },
  }));

  const maxVisible = 8;
  const visibleItems = items.slice(0, maxVisible);

  const content = (
    <div className={dropdownContainer} role="listbox">
      {visibleItems.length === 0 ? (
        <div className={emptyState}>No matching cards</div>
      ) : (
        visibleItems.map((item, index) => {
          const classes = [
            dropdownItem,
            index === selectedIndex ? dropdownItemActive : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <div
              key={item.id}
              className={classes}
              role="option"
              aria-selected={index === selectedIndex}
              onClick={() => command(item)}
            >
              <span
                className={typeIndicator}
                style={{ backgroundColor: typeColors[item.type] }}
              />
              <span className={itemShortname}>@{item.shortname}</span>
              <span className={itemTitle}>{item.title}</span>
            </div>
          );
        })
      )}
    </div>
  );

  // Use portal for z-index isolation
  return createPortal(content, document.body);
});

/**
 * Creates a TipTap suggestion renderer for the SuggestionDropdown.
 * filterCards is called with the query text to produce filtered items.
 */
export function createSuggestionRenderer(
  filterCards: (query: string) => SuggestionCard[]
) {
  let component: {
    ref: SuggestionDropdownRef | null;
    destroy: () => void;
    updateProps: (props: SuggestionDropdownProps) => void;
  } | null = null;
  let container: HTMLDivElement | null = null;
  let root: ReturnType<typeof import('react-dom/client').createRoot> | null = null;

  return {
    items: ({ query }: { query: string }) => filterCards(query),

    render: () => ({
      onStart: (props: {
        items: SuggestionCard[];
        command: (item: { id: string; label: string }) => void;
        clientRect?: (() => DOMRect | null) | null;
      }) => {
        container = document.createElement('div');
        document.body.appendChild(container);

        const wrappedCommand = (item: SuggestionCard) => {
          props.command({ id: item.id, label: item.shortname });
        };

        // We render via a simple approach using ReactDOM
        import('react-dom/client').then(({ createRoot }) => {
          root = createRoot(container!);
          const refCallback = (ref: SuggestionDropdownRef | null) => {
            if (component) {
              component.ref = ref;
            }
          };
          component = {
            ref: null,
            destroy: () => {
              root?.unmount();
              container?.remove();
            },
            updateProps: (newProps: SuggestionDropdownProps) => {
              root?.render(
                <SuggestionDropdown
                  ref={refCallback}
                  items={newProps.items}
                  command={newProps.command}
                />
              );
            },
          };
          component.updateProps({
            items: props.items,
            command: wrappedCommand,
          });
        });
      },

      onUpdate: (props: {
        items: SuggestionCard[];
        command: (item: { id: string; label: string }) => void;
      }) => {
        const wrappedCommand = (item: SuggestionCard) => {
          props.command({ id: item.id, label: item.shortname });
        };
        component?.updateProps({
          items: props.items,
          command: wrappedCommand,
        });
      },

      onKeyDown: (props: { event: KeyboardEvent }) => {
        if (props.event.key === 'Escape') {
          component?.destroy();
          return true;
        }
        return component?.ref?.onKeyDown(props) ?? false;
      },

      onExit: () => {
        component?.destroy();
      },
    }),
  };
}
