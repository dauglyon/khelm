import { useState, useRef, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useCreateSessionMutation } from '../hooks/useCreateSession';
import { Button, TextInput } from '@/common/components';
import {
  dialogContainer,
  dialogTitle,
  form,
  label,
  buttonRow,
  errorText,
} from './NewSessionDialog.css';

const SESSION_TITLE_INPUT_ID = 'new-session-title-input';

export function NewSessionDialog() {
  const [title, setTitle] = useState('');
  const { createSession, isCreating, error } = useCreateSessionMutation();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const response = await createSession(title.trim());
      if (response.status === 201) {
        navigate(`/session/${response.data.id}`);
      }
    } catch {
      // Error is handled by the mutation state
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className={dialogContainer}>
      <h2 className={dialogTitle}>New Session</h2>
      <form className={form} onSubmit={handleSubmit}>
        <div>
          <label className={label} htmlFor={SESSION_TITLE_INPUT_ID}>Session title</label>
          <TextInput
            ref={inputRef}
            id={SESSION_TITLE_INPUT_ID}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter session title..."
            error={!!error}
          />
        </div>
        {error && (
          <div className={errorText} role="alert">
            Failed to create session. Please try again.
          </div>
        )}
        <div className={buttonRow}>
          <Button
            variant="ghost"
            color="neutral"
            onClick={handleCancel}
            type="button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!title.trim()}
            loading={isCreating}
          >
            Create
          </Button>
        </div>
      </form>
    </div>
  );
}
