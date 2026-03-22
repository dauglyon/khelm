import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router';
import type { Session } from '@/generated/api/sessions.schemas';
import { useUpdateSessionMutation } from '../hooks/useUpdateSession';
import { useDeleteSessionMutation } from '../hooks/useDeleteSession';
import { MemberAvatars } from './MemberAvatars';
import { Button, IconButton, Icon, TextInput } from '@/common/components';
import {
  headerContent,
  titleDisplay,
  savingIndicator,
  actionsMenu,
  confirmOverlay,
  confirmDialog,
  confirmTitle,
  confirmText,
  confirmButtons,
} from './SessionHeader.css';

interface SessionHeaderProps {
  session: Session;
}

export function SessionHeader({ session }: SessionHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(session.title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { updateSession, isUpdating } = useUpdateSessionMutation();
  const { deleteSession, isDeleting } = useDeleteSessionMutation();

  useEffect(() => {
    setEditValue(session.title);
  }, [session.title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleTitleClick = () => {
    setIsEditing(true);
  };

  const commitEdit = async () => {
    setIsEditing(false);
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== session.title) {
      await updateSession(session.id, { title: trimmed });
    } else {
      setEditValue(session.title);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditValue(session.title);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const handleArchive = async () => {
    await updateSession(session.id, { status: 'archived' });
  };

  const handleDelete = async () => {
    await deleteSession(session.id);
    navigate('/');
  };

  return (
    <>
      <div className={headerContent} data-testid="session-header">
        {isEditing ? (
          <TextInput
            ref={inputRef}
            size="sm"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            aria-label="Edit session title"
          />
        ) : (
          <span
            className={titleDisplay}
            onClick={handleTitleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleClick();
            }}
            data-testid="session-title"
          >
            {session.title}
          </span>
        )}
        {isUpdating && <span className={savingIndicator}>Saving...</span>}
        <MemberAvatars memberIds={session.memberIds} />
        <div className={actionsMenu}>
          <IconButton
            icon={<Icon name="archive" size={16} />}
            aria-label="Archive session"
            variant="ghost"
            color="neutral"
            size="sm"
            onClick={handleArchive}
            disabled={isUpdating}
          />
          <IconButton
            icon={<Icon name="trash" size={16} />}
            aria-label="Delete session"
            variant="ghost"
            color="danger"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
          />
        </div>
      </div>

      {showDeleteConfirm && (
        <div className={confirmOverlay} aria-modal="true">
          <div className={confirmDialog} role="alertdialog" aria-label="Confirm delete">
            <div className={confirmTitle}>Delete Session</div>
            <div className={confirmText}>
              Are you sure you want to delete this session? This action cannot be undone.
            </div>
            <div className={confirmButtons}>
              <Button
                variant="ghost"
                color="neutral"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                color="danger"
                onClick={handleDelete}
                loading={isDeleting}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
