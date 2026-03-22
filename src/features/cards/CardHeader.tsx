import { useState, useRef, useCallback, type KeyboardEvent } from 'react';
import { Chip } from '@/common/components/Chip';
import { IconButton } from '@/common/components/IconButton';
import { Icon } from '@/common/components/Icon';
import { StatusIndicator } from './StatusIndicator';
import { cardTypeToInputType, cardTypeLabel } from './types';
import type { CardType, CardStatus } from './types';
import {
  headerContainer,
  shortnameText,
  shortnameInput,
  actionsContainer,
  deleteConfirm,
} from './CardHeader.css';

export interface CardHeaderProps {
  cardId: string;
  shortname: string;
  type: CardType;
  status: CardStatus;
  onShortnameChange: (newName: string) => void;
  onOpenChat: () => void;
  onCopy: () => void;
  onPin: () => void;
  onDelete: () => void;
  isPinned?: boolean;
}

export function CardHeader({
  shortname,
  type,
  status,
  onShortnameChange,
  onOpenChat,
  onCopy,
  onPin,
  onDelete,
  isPinned = false,
}: CardHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(shortname);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatButtonRef = useRef<HTMLButtonElement>(null);

  const startEdit = useCallback(() => {
    setEditValue(shortname);
    setIsEditing(true);
    // Focus happens after render via autoFocus
  }, [shortname]);

  const saveEdit = useCallback(() => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== shortname) {
      onShortnameChange(trimmed);
    }
    setIsEditing(false);
  }, [editValue, shortname, onShortnameChange]);

  const cancelEdit = useCallback(() => {
    setEditValue(shortname);
    setIsEditing(false);
  }, [shortname]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveEdit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelEdit();
      }
    },
    [saveEdit, cancelEdit]
  );

  const handleDeleteClick = useCallback(() => {
    if (confirmingDelete) {
      onDelete();
      setConfirmingDelete(false);
    } else {
      setConfirmingDelete(true);
    }
  }, [confirmingDelete, onDelete]);

  const handleCancelDelete = useCallback(() => {
    setConfirmingDelete(false);
  }, []);

  return (
    <div className={headerContainer} role="banner">
      {isEditing ? (
        <input
          ref={inputRef}
          className={shortnameInput}
          value={editValue}
          onChange={(e) =>
            setEditValue(e.target.value.slice(0, 60))
          }
          onBlur={saveEdit}
          onKeyDown={handleKeyDown}
          maxLength={60}
          autoFocus
          aria-label="Edit card name"
        />
      ) : (
        <button
          type="button"
          className={shortnameText}
          onClick={startEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              startEdit();
            }
          }}
          aria-label={`Card name: ${shortname}. Click to edit.`}
        >
          {shortname}
        </button>
      )}

      <Chip
        inputType={cardTypeToInputType(type)}
        label={cardTypeLabel(type)}
        size="sm"
      />

      <StatusIndicator status={status} />

      <div className={actionsContainer}>
        <IconButton
          ref={chatButtonRef}
          icon={<Icon name="chat" size={16} />}
          aria-label="Open chat"
          variant="ghost"
          size="sm"
          color="neutral"
          onClick={onOpenChat}
          data-chat-button
        />
        <IconButton
          icon={<Icon name="copy" size={16} />}
          aria-label="Copy card"
          variant="ghost"
          size="sm"
          color="neutral"
          onClick={onCopy}
        />
        <IconButton
          icon={<Icon name={isPinned ? 'pin-off' : 'pin'} size={16} />}
          aria-label={isPinned ? 'Unpin card' : 'Pin card'}
          variant="ghost"
          size="sm"
          color="neutral"
          onClick={onPin}
        />

        {confirmingDelete ? (
          <span className={deleteConfirm}>
            <span>Delete?</span>
            <IconButton
              icon={<Icon name="check" size={16} />}
              aria-label="Confirm delete"
              variant="ghost"
              size="sm"
              color="danger"
              onClick={handleDeleteClick}
            />
            <IconButton
              icon={<Icon name="close" size={16} />}
              aria-label="Cancel delete"
              variant="ghost"
              size="sm"
              color="neutral"
              onClick={handleCancelDelete}
            />
          </span>
        ) : (
          <IconButton
            icon={<Icon name="trash" size={16} />}
            aria-label="Delete card"
            variant="ghost"
            size="sm"
            color="danger"
            onClick={handleDeleteClick}
          />
        )}
      </div>
    </div>
  );
}
