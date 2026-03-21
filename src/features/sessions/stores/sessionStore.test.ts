import { describe, it, expect, beforeEach } from 'vitest';
import { useSessionStore } from './sessionStore';

describe('sessionStore', () => {
  beforeEach(() => {
    useSessionStore.setState({ activeSessionId: null });
  });

  it('initial activeSessionId is null', () => {
    expect(useSessionStore.getState().activeSessionId).toBeNull();
  });

  it('setActiveSession updates the active session ID', () => {
    useSessionStore.getState().setActiveSession('session-123');
    expect(useSessionStore.getState().activeSessionId).toBe('session-123');
  });

  it('setActiveSession can clear the active session', () => {
    useSessionStore.getState().setActiveSession('session-123');
    useSessionStore.getState().setActiveSession(null);
    expect(useSessionStore.getState().activeSessionId).toBeNull();
  });
});
