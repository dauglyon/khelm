import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { LazyMotionProvider } from '@/common/animations/LazyMotionProvider';
import { useLayoutStore } from '@/common/stores/layoutStore';
import { Sidebar } from './Sidebar';

function renderSidebar(open: boolean) {
  return render(
    <LazyMotionProvider>
      <Sidebar open={open} />
    </LazyMotionProvider>
  );
}

describe('Sidebar', () => {
  beforeEach(() => {
    useLayoutStore.setState({ sidebarOpen: true });
  });

  it('renders sidebar when open', () => {
    renderSidebar(true);
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('renders section headings', () => {
    renderSidebar(true);
    expect(screen.getByText('Session Info')).toBeInTheDocument();
    expect(screen.getByText('Card List')).toBeInTheDocument();
    expect(screen.getByText('Notes')).toBeInTheDocument();
  });

  it('renders with closed state', () => {
    renderSidebar(false);
    const sidebarEl = screen.getByTestId('sidebar');
    expect(sidebarEl).toBeInTheDocument();
  });

  it('toggle changes sidebar state in store', () => {
    useLayoutStore.getState().toggleSidebar();
    expect(useLayoutStore.getState().sidebarOpen).toBe(false);
  });
});
