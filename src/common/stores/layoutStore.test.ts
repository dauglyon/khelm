import { describe, it, expect, beforeEach } from 'vitest';
import { useLayoutStore } from './layoutStore';

describe('layoutStore', () => {
  beforeEach(() => {
    useLayoutStore.setState({ sidebarOpen: true });
  });

  it('starts with sidebar open', () => {
    expect(useLayoutStore.getState().sidebarOpen).toBe(true);
  });

  it('toggleSidebar switches state', () => {
    useLayoutStore.getState().toggleSidebar();
    expect(useLayoutStore.getState().sidebarOpen).toBe(false);
    useLayoutStore.getState().toggleSidebar();
    expect(useLayoutStore.getState().sidebarOpen).toBe(true);
  });

  it('setSidebarOpen sets explicit state', () => {
    useLayoutStore.getState().setSidebarOpen(false);
    expect(useLayoutStore.getState().sidebarOpen).toBe(false);
    useLayoutStore.getState().setSidebarOpen(true);
    expect(useLayoutStore.getState().sidebarOpen).toBe(true);
  });
});
