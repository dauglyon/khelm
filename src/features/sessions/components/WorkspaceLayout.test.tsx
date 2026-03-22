import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { WorkspaceLayout } from './WorkspaceLayout';
import { useLayoutStore } from '@/common/stores/layoutStore';
import { LazyMotionProvider } from '@/common/animations';

function renderLayout(children: React.ReactNode = 'Content') {
  return render(
    <LazyMotionProvider>
      <WorkspaceLayout>{children}</WorkspaceLayout>
    </LazyMotionProvider>
  );
}

describe('WorkspaceLayout', () => {
  beforeEach(() => {
    useLayoutStore.setState({ sidebarOpen: true });
  });

  it('renders the header region', () => {
    renderLayout();
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders the toolbar region', () => {
    renderLayout();
    expect(screen.getByTestId('toolbar')).toBeInTheDocument();
  });

  it('renders the main workspace region', () => {
    renderLayout();
    expect(screen.getByTestId('main-workspace')).toBeInTheDocument();
  });

  it('renders children inside the main workspace', () => {
    renderLayout(<div data-testid="child-content">Test Child</div>);
    const mainWorkspace = screen.getByTestId('main-workspace');
    expect(mainWorkspace).toContainElement(screen.getByTestId('child-content'));
  });

  it('renders the header with app logo text', () => {
    renderLayout();
    expect(screen.getByText('The Helm')).toBeInTheDocument();
  });

  it('renders toolbar input placeholder', () => {
    renderLayout();
    expect(screen.getByText('Input surface placeholder')).toBeInTheDocument();
  });

  describe('sidebar integration', () => {
    it('renders sidebar inside layout', () => {
      renderLayout();
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('sidebar has open state when store is open', () => {
      useLayoutStore.setState({ sidebarOpen: true });
      renderLayout();
      expect(screen.getByTestId('sidebar')).toHaveAttribute('data-state', 'open');
    });

    it('sidebar has closed state when store is closed', () => {
      useLayoutStore.setState({ sidebarOpen: false });
      renderLayout();
      expect(screen.getByTestId('sidebar')).toHaveAttribute('data-state', 'closed');
    });

    it('toggling sidebar state changes data-state attribute', () => {
      useLayoutStore.setState({ sidebarOpen: true });
      renderLayout();
      expect(screen.getByTestId('sidebar')).toHaveAttribute('data-state', 'open');

      act(() => {
        useLayoutStore.getState().toggleSidebar();
      });

      expect(screen.getByTestId('sidebar')).toHaveAttribute('data-state', 'closed');
    });
  });
});
